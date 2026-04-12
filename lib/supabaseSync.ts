import { getGlucosePredictions } from "@/storage/glucosePredictions";
import {
  getAllGlucoseReadings,
  getFoodLogForDay,
  getSensorPacketsInWindow,
  SensorPacketRow,
  type GlucoseReadingRow,
} from "./db";
import { supabase } from "./supabase";

async function getUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id ?? null;
  return userId ?? null;
}

//upsert in batches
async function upsertInBatches<T extends object>(
  table: string,
  rows: T[],
  onConflict: string,
  batchSize = 200,
): Promise<void> {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).upsert(batch, { onConflict });

    if (error) {
      console.error(`[sync]`);
    }
  }
}

//glucose readings
export async function syncGlucoseReading(): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) return;

    const readings = await getAllGlucoseReadings();
    if (!readings.length) return;

    const rows = readings.map((r: GlucoseReadingRow) => ({
      user_id: userId,
      reading_id: r.id,
      timestamp: r.timestamp,
      unix: r.unix,
      glucose_mg_dl: r.glucose_mg_dl,
      context: r.context,
      meal_id: r.meal_id ?? null,
    }));

    await upsertInBatches("sync_glucose_readings", rows, "user_id,reading_id");
    console.log(`[sync] glucose readings =>  ${rows.length} rows`);
  } catch (error) {
    console.error("[sync] syncGlucoseReadings error: ", error);
  }
}

//food log - last 90 fays
export async function syncFoodLog(): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) return;

    const rows: object[] = [];
    const today = new Date();

    for (let d = 0; d < 90; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      const dayEntries = await getFoodLogForDay(dateStr);

      for (const e of dayEntries) {
        rows.push({
          user_id: userId,
          entry_id: e.id,
          recipe_id: e.recipe_id ?? null,
          recipe_name: e.recipe_name,
          timestamp: e.timestamp,
          meal_type: e.meal_type,
          protein: e.protein,
          carbs: e.carbs,
          fat: e.fat,
          fiber: e.fiber,
          calories: e.calories ?? 0,
          is_liquid: e.is_liquid,
          image_url: e.image_url ?? null,
        });
      }
    }
    if (!rows.length) return;
    await upsertInBatches("sync_food_log", rows, "user_id,entry_id");
    console.log(`[sync] food log  → ${rows.length} rows`);
  } catch (err) {
    console.error("[sync] syncFoodLog error:", err);
  }
}

// sensor packets last 30 days
export async function syncSensorPackets(): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) return;

    const startUnix = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const endUnix = Math.floor(Date.now() / 1000);

    const packets = await getSensorPacketsInWindow(startUnix, endUnix);
    if (!packets.length) return;
    const rows = packets.map((p: SensorPacketRow) => ({
      user_id: userId,
      seq: p.seq,
      unix: p.unix,
      timestamp: p.timestamp,
      steps: p.steps,
      vm: p.vm,
      peak_vm: p.peak_vm,
      hr: p.hr,
      hrv: p.hrv,
      hrv_drop: p.hrv_drop,
      hr_drop: p.hr_drop,
      hr_stability: p.hr_stability,
      sleep_score: p.sleep_score,
      interpolated: p.interpolated,
    }));

    await upsertInBatches("sync_sensor_packets", rows, "user_id,seq");
    console.log(`[sync] sensor packets → ${rows.length} rows`);
  } catch (err) {
    console.error("[sync] syncSensorPackets error:", err);
  }
}

// Glucose Predictions from thrive.db
export async function syncGlucosePredictions(): Promise<void> {
  try {
    const userId = await getUserId();
    if (!userId) return;

    const predictions = await getGlucosePredictions();
    if (!predictions.length) return;

    const rows = predictions.map((p) => ({
      user_id: userId,
      predicted_at: p.predicted_at,
      time_point: p.time_point,
      mu: p.mu,
      lower: p.lower,
      upper: p.upper,
    }));

    await upsertInBatches(
      "sync_glucose_predictions",
      rows,
      "user_id,predicted_at,time_point",
    );
    console.log(`[sync] glucose predictions  → ${rows.length} rows`);
  } catch (err) {
    console.error("[sync] syncGlucosePrediction error:", err);
  }
}

// call on app foreground / periodic background task
export async function syncAll(): Promise<void> {
  console.log(`[sync] starting full sync...`);
  await Promise.allSettled([
    syncGlucoseReading(),
    syncFoodLog(),
    syncSensorPackets(),
    syncGlucosePredictions(),
  ]);
  console.log("[sync] done");
}
