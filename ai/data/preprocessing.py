from __future__ import annotations
import json
import re
import sqlite3
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime as dt
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import os

from supabase import create_client, Client

DEFAULT_DB_PATH = "./glucose_app.db"

WINDOW_PRE_SEC        = 30 * 60
WINDOW_POST_SEC       = 2 * 60 * 60
MIN_PACKETS_IN_WINDOW = 3

POST_HR_START = 15 * 60
POST_HR_END   = 90 * 60

@dataclass
class MedicationEntry:
    med_id:       str
    dose:         float
    t_k:          float
    med_class:    str
    insulin_type: Optional[str] = None


@dataclass
class MealFeatures:
    meal_id:              str
    timestamp:            dt
    hour:                 float
    carbs:                float
    fiber_ratio:          float
    fatprotein:           float
    is_liquid:            bool
    medication_period:    str                   = "unknown"
    insulin_medications:  List[MedicationEntry] = field(default_factory=list)
    other_medications:    List[MedicationEntry] = field(default_factory=list)


@dataclass
class SensorWindow:
    hr_baseline:       float
    hrv_baseline:      float
    hr_peak:           float
    hrv_post_mean:     float
    hr_rise_per_carb:  float
    activity_mean:     float
    sleep_score:       float
    real_packet_count: int
    hrv_drop:          float
    hr_postprandial:   float
    hrv_drop_norm:     float
    hr_response:       float


@dataclass
class FingerstickAnchor:
    timestamp:     dt
    glucose_mg_dl: float
    context:       str


@dataclass
class TrainingSequence:
    meal:           MealFeatures
    sensor:         SensorWindow
    fingerstick:    Optional[FingerstickAnchor]
    training_phase: int


def _connect(db_path: str) -> sqlite3.Connection:
    path = Path(db_path)
    if not path.exists():
        raise FileNotFoundError(
            f"[preprocessing] SQLite database not found at '{db_path}'.\n"
            f"If running locally, export glucose_app.db from the device first."
        )
    conn = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    return conn


def _parse_iso(ts: str) -> dt:
    return dt.fromisoformat(ts.replace("Z", "+00:00"))


def _get_supabase(url: Optional[str] = None, key: Optional[str] = None) -> Client:
    url = url or os.environ.get("EXPO_PUBLIC_SUPABASE_URL")
    key = key or os.environ.get("EXPO_PUBLIC_SUPABASE_KEY")
    if not url or not key:
        raise EnvironmentError(
            "[preprocessing] Supabase credentials not found. Set "
            "EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY."
        )
    return create_client(url, key)


def fetch_medication(
    user_id:      str,
    supabase_url: Optional[str] = None,
    supabase_key: Optional[str] = None,
) -> List[MedicationEntry]:
    sb = _get_supabase(supabase_url, supabase_key)

    resp = (
        sb.table("medication")
        .select("id, medication_name, med_class, dosage, insulin_type")
        .eq("user_id", user_id)
        .eq("isActive", True)
        .execute()
    )
    rows = resp.data or []

    if not rows:
        print(f"    [preprocessing] No active medications found for user {user_id}")
        return []

    entries: List[MedicationEntry] = []

    for med in rows:
        dose_match = re.search(r"(\d+\.?\d*)", med.get("dosage") or "")
        if not dose_match:
            continue
        dose = float(dose_match.group(1))

        current_class = med.get("med_class")
        if not current_class:
            assigned_class = _normalise_med_class(None, med.get("medication_name", ""))
            try:
                sb.table("medication") \
                  .update({"med_class": assigned_class}) \
                  .eq("id", med["id"]) \
                  .execute()
                print(f"    [preprocessing] Assigned med_class='{assigned_class}' "
                      f"to medication {med['id']}")
            except Exception as e:
                print(f"    [preprocessing] Failed to update med_class: {e}")
            med_class = assigned_class
        else:
            med_class = current_class.strip().lower()

        alerts_resp = (
            sb.table("medicine_alerts")
            .select("time")
            .eq("medication_id", med["id"])
            .eq("enabled", True)
            .execute()
        )
        alerts = alerts_resp.data or []

        for alert in alerts:
            try:
                hour, minutes = map(int, alert["time"].split(":"))
                entries.append(MedicationEntry(
                    med_id       = str(med["id"]),
                    dose         = dose,
                    t_k          = hour + minutes / 60.0,
                    med_class    = med_class,
                    insulin_type = med.get("insulin_type"),
                ))
            except Exception as e:
                print(f"    [preprocessing] Skipping alert for med {med['id']}: {e}")

    print(f"    [preprocessing] Loaded {len(entries)} medication schedule entries "
          f"({len(rows)} medications)")
    return entries


def _normalise_med_class(med_class: Optional[str], name: str) -> str:
    name_lower = (name or "").lower()
    if "metformin"   in name_lower:                                            return "biguanide"
    if any(x in name_lower for x in ["glipizide","glyburide","glimepiride"]): return "sulfonylurea"
    if "insulin"     in name_lower:
        return "basal_insulin" if any(x in name_lower for x in ["glargine","detemir"]) else "bolus_insulin"
    if any(x in name_lower for x in ["liraglutide","exenatide"]):             return "glp1_daily"
    if any(x in name_lower for x in ["dulaglutide","semaglutide"]):           return "glp1_weekly"
    if any(x in name_lower for x in ["empagliflozin","dapagliflozin",
                                      "canagliflozin","sglt2"]):               return "sglt2"
    if any(x in name_lower for x in ["pioglitazone","rosiglitazone"]):        return "tzd"
    return "other"


def _medication_period_at(meal_ts: dt, medications: List[MedicationEntry]) -> str:
    if not medications:
        return "unknown"
    meal_hour = meal_ts.hour + meal_ts.minute / 60.0
    MAX_GAP   = 6.0
    best:     Optional[MedicationEntry] = None
    best_gap: float = float("inf")

    for med in medications:
        gap = abs(med.t_k - meal_hour)
        gap = min(gap, 24.0 - gap)
        if gap < best_gap:
            best_gap = gap
            best     = med

    if best is None or best_gap > MAX_GAP:
        return "unknown"
    return best.med_class


def fetch_meals(
    conn:       sqlite3.Connection,
    start_date: Optional[str] = None,
    end_date:   Optional[str] = None,
) -> List[MealFeatures]:
    query  = "SELECT * FROM food_log"
    params: List[str] = []

    if start_date and end_date:
        query += " WHERE timestamp >= ? AND timestamp <= ?"
        params = [start_date, end_date + "T23:59:59Z"]
    elif start_date:
        query += " WHERE timestamp >= ?"
        params = [start_date]

    query += " ORDER BY timestamp ASC"
    rows   = conn.execute(query, params).fetchall()
    meals: List[MealFeatures] = []

    for row in rows:
        try:
            carbs = float(row["carbs"] or 0)
            if carbs <= 0:
                continue

            ts        = _parse_iso(row["timestamp"])
            fat       = float(row["fat"]     or 0)
            protein   = float(row["protein"] or 0)
            fiber     = float(row["fiber"]   or 0)
            total_mac = carbs + fat + protein

            meals.append(MealFeatures(
                meal_id     = str(row["id"]),
                timestamp   = ts,
                hour        = ts.hour + ts.minute / 60.0,
                carbs       = carbs,
                fiber_ratio = round(fiber / carbs        if carbs > 0      else 0.15, 4),
                fatprotein  = round((fat + protein) / total_mac if total_mac > 0 else 0.2, 4),
                is_liquid   = bool(row["is_liquid"]),
               
            ))
        except Exception as e:
            print(f"    [preprocessing] Skipping food_log row {row['id']}: {e}")

    print(f"    [preprocessing] Loaded {len(meals)} meals with carbs > 0")
    return meals

def fetch_sensor_window(
    conn:      sqlite3.Connection,
    meal_unix: int,
    carbs:     float,
) -> SensorWindow:
    rows = conn.execute(
        """
        SELECT hr, hrv, vm, sleep_score, unix, interpolated
        FROM sensor_packets
        WHERE unix >= ? AND unix <= ?
        ORDER BY unix ASC
        """,
        [meal_unix - WINDOW_PRE_SEC, meal_unix + WINDOW_POST_SEC],
    ).fetchall()

    if len(rows) < MIN_PACKETS_IN_WINDOW:
        return _empty_sensor_window()

    pre_rows  = [r for r in rows if r["unix"] <  meal_unix]
    post_rows = [r for r in rows if r["unix"] >= meal_unix]

    if pre_rows:
        real_pre     = [r for r in pre_rows if not r["interpolated"]] or pre_rows
        hr_baseline  = float(np.mean([r["hr"]  for r in real_pre]))
        hrv_baseline = float(np.mean([r["hrv"] for r in real_pre]))
    else:
        hr_baseline  = float(post_rows[0]["hr"])
        hrv_baseline = float(post_rows[0]["hrv"])

    if not post_rows:
        return _empty_sensor_window()

    real_post     = [r for r in post_rows if not r["interpolated"]] or post_rows
    hr_peak       = float(max(r["hr"]  for r in real_post))
    hrv_post_mean = float(np.mean([r["hrv"] for r in real_post]))
    activity_mean = float(np.mean([r["vm"]  for r in real_post]))
    hr_rise       = hr_peak - hr_baseline

    post_hr_rows    = [r for r in real_post
                       if meal_unix + POST_HR_START <= r["unix"] <= meal_unix + POST_HR_END]
    hr_postprandial = float(np.mean([r["hr"] for r in post_hr_rows])) if post_hr_rows else hr_peak
    hrv_drop        = hrv_baseline - hrv_post_mean
    hrv_drop_norm   = round(hrv_drop / hrv_baseline, 6) if hrv_baseline > 0 else 0.0
    hr_response     = hr_postprandial - hr_baseline
    
    sleep_row = conn.execute(
        """
        SELECT sleep_score FROM sensor_packets
        WHERE unix < ? AND sleep_score > 0
        ORDER BY unix DESC LIMIT 1
        """,
        [meal_unix],
    ).fetchone()

    real_count = len([r for r in rows if not r["interpolated"]])

    return SensorWindow(
        hr_baseline       = round(hr_baseline,   4),
        hrv_baseline      = round(hrv_baseline,  4),
        hr_peak           = round(hr_peak,        4),
        hrv_post_mean     = round(hrv_post_mean,  4),
        hr_rise_per_carb  = round(hr_rise / carbs if carbs > 0 else 0.0, 6),
        activity_mean     = round(activity_mean,  4),
        sleep_score       = round(float(sleep_row["sleep_score"]) if sleep_row else 0.0, 4),
        real_packet_count = real_count,
        hrv_drop          = round(hrv_drop,        4),
        hr_postprandial   = round(hr_postprandial, 4),
        hrv_drop_norm     = hrv_drop_norm,
        hr_response       = round(hr_response,     4),
    )


def _empty_sensor_window() -> SensorWindow:
    return SensorWindow(
        hr_baseline=0.0, hrv_baseline=0.0, hr_peak=0.0, hrv_post_mean=0.0,
        hr_rise_per_carb=0.0, activity_mean=0.0, sleep_score=0.0,
        real_packet_count=0, hrv_drop=0.0, hr_postprandial=0.0,
        hrv_drop_norm=0.0, hr_response=0.0,
    )



def fetch_fingersticks(
    json_path:    Optional[str]       = None,
    entries_list: Optional[List[Dict]] = None,
) -> List[FingerstickAnchor]:
    if entries_list is not None:
        entries = entries_list
    elif json_path and Path(json_path).exists():
        with open(json_path) as f:
            entries = json.load(f)
    else:
        if json_path:
            print(f"    [preprocessing] Fingerstick file not found at '{json_path}'")
        return []

    anchors = []
    for e in entries:
        try:
            anchors.append(FingerstickAnchor(
                timestamp     = _parse_iso(e["timestamp"]),
                glucose_mg_dl = float(e["glucose"]),
                context       = e.get("context", "other"),
            ))
        except Exception as err:
            print(f"    [preprocessing] Skipping fingerstick entry: {err}")

    print(f"    [preprocessing] Loaded {len(anchors)} fingerstick anchors")
    return anchors


def _nearest_fingerstick(
    meal_ts: dt,
    anchors: List[FingerstickAnchor],
    max_hrs: float = 2.0,
) -> Optional[FingerstickAnchor]:
    if not anchors:
        return None
    meal_t = meal_ts.timestamp()
    best   = min(anchors, key=lambda a: abs(a.timestamp.timestamp() - meal_t))
    if abs(best.timestamp.timestamp() - meal_t) > max_hrs * 3600:
        return None
    return best


def build_sequences(
    conn:         sqlite3.Connection,
    meals:        List[MealFeatures],
    fingersticks: List[FingerstickAnchor],
    medications:  List[MedicationEntry],
) -> List[TrainingSequence]:
    print(f"    [preprocessing] Building sequences for {len(meals)} meals...")
    sequences: List[TrainingSequence] = []
    skipped = 0
    t0 = meals[0].timestamp if meals else None

    insulin_meds = [m for m in medications if "insulin" in m.med_class]
    other_meds   = [m for m in medications if "insulin" not in m.med_class]

    for meal in meals:
        meal_unix = int(meal.timestamp.timestamp())
        meal_day  = (meal.timestamp - t0).days if t0 else 0
        phase     = 1 if meal_day <= 2 else (2 if meal_day <= 7 else 3)

        sensor = fetch_sensor_window(conn, meal_unix, meal.carbs)

        if phase == 3 and sensor.real_packet_count == 0:
            skipped += 1
            continue

        fingerstick = _nearest_fingerstick(meal.timestamp, fingersticks) if phase <= 2 else None

        if phase == 1 and fingerstick is None and sensor.real_packet_count == 0:
            skipped += 1
            continue

        meal.insulin_medications = insulin_meds
        meal.other_medications   = other_meds          
        meal.medication_period   = _medication_period_at(meal.timestamp, medications)

        sequences.append(TrainingSequence(
            meal           = meal,
            sensor         = sensor,
            fingerstick    = fingerstick,
            training_phase = phase,
        ))

    print(
        f"    [preprocessing] {len(sequences)} sequences "
        f"({skipped} skipped — no supervision signal)"
    )
    return sequences


def split_sequences(
    sequences: List[TrainingSequence],
    train_pct: float = 0.70,
    val_pct:   float = 0.15,
    seed:      int   = 42,
) -> Tuple[List[TrainingSequence], List[TrainingSequence], List[TrainingSequence]]:
    rng = np.random.default_rng(seed)
    n   = len(sequences)
    idx = rng.permutation(n)
    t   = int(n * train_pct)
    v   = t + int(n * val_pct)

    train = [sequences[i] for i in idx[:t]]
    val   = [sequences[i] for i in idx[t:v]]
    test  = [sequences[i] for i in idx[v:]]

    print(f"    [preprocessing] Split → train={len(train)}  val={len(val)}  test={len(test)}")
    return train, val, test


def _med_entry_to_dict(m: MedicationEntry) -> Dict:
    return {
        "med_id":       m.med_id,
        "dose":         m.dose,
        "t_k":          m.t_k,
        "med_class":    m.med_class,
        "insulin_type": m.insulin_type,
    }


def sequences_to_dict(seqs: List[TrainingSequence]) -> Dict:
    return {
        "meal_features": [
            {
                "meal_id":             s.meal.meal_id,
                "timestamp":           s.meal.timestamp.isoformat(),
                "hour":                s.meal.hour,
                "carbs":               s.meal.carbs,
                "fiber_ratio":         s.meal.fiber_ratio,
                "fatprotein":          s.meal.fatprotein,
                "is_liquid":           s.meal.is_liquid,
                "medication_period":   s.meal.medication_period,
                # BUG 5 FIX: was `other_edications` (typo) + MedicationEntry objects
                #            are not JSON-serialisable — convert to dicts
                "insulin_medications": [_med_entry_to_dict(m) for m in s.meal.insulin_medications],
                "other_medications":   [_med_entry_to_dict(m) for m in s.meal.other_medications],
            }
            for s in seqs
        ],
        "sensor_windows": [
            {
                "hr_baseline":       s.sensor.hr_baseline,
                "hrv_baseline":      s.sensor.hrv_baseline,
                "hr_peak":           s.sensor.hr_peak,
                "hrv_post_mean":     s.sensor.hrv_post_mean,
                "hr_rise_per_carb":  s.sensor.hr_rise_per_carb,
                "activity_mean":     s.sensor.activity_mean,
                "sleep_score":       s.sensor.sleep_score,
                "real_packet_count": s.sensor.real_packet_count,
                "hrv_drop":          s.sensor.hrv_drop,
                "hr_postprandial":   s.sensor.hr_postprandial,
                "hrv_drop_norm":     s.sensor.hrv_drop_norm,
                "hr_response":       s.sensor.hr_response,
            }
            for s in seqs
        ],
        "fingersticks": [
            {
                "timestamp":     s.fingerstick.timestamp.isoformat(),
                "glucose_mg_dl": s.fingerstick.glucose_mg_dl,
                "context":       s.fingerstick.context,
            }
            if s.fingerstick else None
            for s in seqs
        ],
        "training_phases": [s.training_phase for s in seqs],
    }


def load_training_data(
    db_path:          str                   = DEFAULT_DB_PATH,
    user_id:          Optional[str]         = None,
    supabase_url:     Optional[str]         = None,
    supabase_key:     Optional[str]         = None,
    fingerstick_json: Optional[str]         = None,
    entries_list:     Optional[List[Dict]]  = None,
    days_since_start: int                   = 0,
    start_date:       Optional[str]         = None,
    end_date:         Optional[str]         = None,
    seed:             int                   = 42,
) -> Tuple[Dict, Dict, Dict, List[Dict]]:
    """
    Returns (train_data, val_data, test_data, meds_dicts).

    meds_dicts is a list of plain dicts used by train.py to build
    MedDurationModel. Gracefully degrades to empty list if user_id
    is not provided or Supabase credentials are missing.
    """
    print(f"\n[preprocessing] Starting pipeline...")
    print(f"  db_path:          {db_path}")
    print(f"  user_id:          {user_id or 'none (no medication fetch)'}")
    print(f"  fingerstick_json: {fingerstick_json or 'none'}")
    print(f"  days_since_start: {days_since_start}")

    medications: List[MedicationEntry] = []
    if user_id:
        try:
            medications = fetch_medication(user_id, supabase_url, supabase_key)
        except Exception as e:
            print(f"  [preprocessing] WARNING: Could not fetch medications: {e}")
            print(f"  [preprocessing] Continuing without medication data.")

    conn = _connect(db_path)
    try:
        meals        = fetch_meals(conn, start_date, end_date)
        fingersticks = fetch_fingersticks(fingerstick_json, entries_list)

        if len(meals) < 5:
            raise ValueError(f"[preprocessing] Only {len(meals)} meals — need at least 5.")

        sequences = build_sequences(conn, meals, fingersticks, medications)

        if len(sequences) < 5:
            raise ValueError(f"[preprocessing] Only {len(sequences)} sequences — need at least 5.")

        train_seqs, val_seqs, test_seqs = split_sequences(sequences, seed=seed)

        meds_dicts = [
            {
                "med_id":       m.med_id,
                "dose":         m.dose,
                "t_k":          m.t_k,
                "med_class":    m.med_class,
                "insulin_type": m.insulin_type,
            }
            for m in medications
        ]

        print(f"\n[preprocessing] Done — {len(sequences)} sequences, "
              f"{len(medications)} medication entries\n")

        return (
            sequences_to_dict(train_seqs),
            sequences_to_dict(val_seqs),
            sequences_to_dict(test_seqs),
            meds_dicts,
        )
    finally:
        conn.close()