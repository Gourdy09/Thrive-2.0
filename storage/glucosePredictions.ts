/**
 * storage/glucosePredictions.ts
 *
 * Stores AI-generated glucose forecast data entirely on-device using SQLite.
 * No data ever leaves the device — HIPAA-safe by design.
 */

import * as SQLite from "expo-sqlite";

export interface GlucosePrediction {
  id?: number;
  predicted_at: string; // ISO-8601
  time_point: number; // fractional hour 0–24
  mu: number; // mean predicted glucose mg/dL
  lower: number; // lower confidence bound
  upper: number; // upper confidence bound
}

// Bump when schema changes — triggers a clean table rebuild on next launch.
const SCHEMA_VERSION = 2;

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync("thrive.db");

  await _db.execAsync("PRAGMA journal_mode = WAL");

  const row = (await _db.getFirstAsync("PRAGMA user_version")) as {
    user_version: number;
  } | null;
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    await _db.execAsync("DROP TABLE IF EXISTS glucose_predictions");
    await _db.execAsync(`
      CREATE TABLE glucose_predictions (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        predicted_at TEXT    NOT NULL,
        time_point   REAL    NOT NULL,
        mu           REAL    NOT NULL,
        lower        REAL    NOT NULL,
        upper        REAL    NOT NULL,
        UNIQUE (predicted_at, time_point)
      )
    `);
    await _db.execAsync(
      "CREATE INDEX IF NOT EXISTS idx_gp_predicted_at ON glucose_predictions (predicted_at)",
    );
    await _db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }

  return _db;
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function saveGlucosePredictions(
  predictions: Omit<GlucosePrediction, "id">[],
): Promise<void> {
  if (!predictions.length) return;

  try {
    const db = await getDb();

    // No explicit transaction — INSERT OR IGNORE handles duplicates safely
    // and avoids all BEGIN/ROLLBACK conflicts with expo-sqlite internals.
    for (const p of predictions) {
      await db.runAsync(
        `INSERT OR IGNORE INTO glucose_predictions
           (predicted_at, time_point, mu, lower, upper)
         VALUES (?, ?, ?, ?, ?)`,
        [p.predicted_at, p.time_point, p.mu, p.lower, p.upper],
      );
    }
  } catch (error) {
    console.error("[glucosePredictions] save error:", error);
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getGlucosePredictions(): Promise<GlucosePrediction[]> {
  try {
    const db = await getDb();
    return await db.getAllAsync<GlucosePrediction>(
      "SELECT * FROM glucose_predictions ORDER BY predicted_at DESC, time_point ASC",
    );
  } catch (error) {
    console.error("[glucosePredictions] fetch error:", error);
    return [];
  }
}

export async function getPredictionsForRun(
  predictedAt: string,
): Promise<GlucosePrediction[]> {
  try {
    const db = await getDb();
    return await db.getAllAsync<GlucosePrediction>(
      "SELECT * FROM glucose_predictions WHERE predicted_at = ? ORDER BY time_point ASC",
      [predictedAt],
    );
  } catch (error) {
    console.error("[glucosePredictions] fetch run error:", error);
    return [];
  }
}

export async function getLatestPredictions(): Promise<GlucosePrediction[]> {
  try {
    const db = await getDb();
    const latest = (await db.getFirstAsync(
      "SELECT predicted_at FROM glucose_predictions ORDER BY predicted_at DESC LIMIT 1",
    )) as { predicted_at: string } | null;
    if (!latest) return [];
    return getPredictionsForRun(latest.predicted_at);
  } catch (error) {
    console.error("[glucosePredictions] fetch latest error:", error);
    return [];
  }
}

// ─── Maintenance ──────────────────────────────────────────────────────────────

export async function pruneOldPredictions(daysToKeep = 90): Promise<void> {
  try {
    const db = await getDb();
    const cutoff = new Date(
      Date.now() - daysToKeep * 24 * 60 * 60 * 1000,
    ).toISOString();
    await db.runAsync(
      "DELETE FROM glucose_predictions WHERE predicted_at < ?",
      [cutoff],
    );
  } catch (error) {
    console.error("[glucosePredictions] prune error:", error);
  }
}
