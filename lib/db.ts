import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

function getDB(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error(
      "[db] database not initlized. Call initDV() at app startup first",
    );
  }
  return db;
}
export async function intiDB(): Promise<void> {
  db = await SQLite.openDatabaseAsync("glucose_app.db");
  // WAl mode makes writes faster and allows concurrent reads/writes
  await db.execAsync("PRAGMA journal_mode = WAL;");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS food_log (
      id          TEXT PRIMARY KEY,
      recipe_id   TEXT,
      recipe_name TEXT NOT NULL,
      timestamp   TEXT NOT NULL,      -- ISO  e.g. "2026-03-01T18:30:00Z"
      meal_type   TEXT NOT NULL,      -- "breakfast" | "lunch" | "dinner" | "snack"
      protein     REAL NOT NULL DEFAULT 0,
      carbs       REAL NOT NULL DEFAULT 0,
      fat         REAL NOT NULL DEFAULT 0,  
      fiber       REAL NOT NULL DEFAULT 0,   
      calories    REAL DEFAULT 0,
      is_liquid   INTEGER NOT NULL DEFAULT 0, -- 0=false 1=true
      image_url   TEXT
    );
  `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_food_log_timestamp
    ON food_log (timestamp);
    `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sensor_packets (
    seq             INTEGER PRIMARY KEY,
    unix            INTEGR NOT NULL,
    timestamp       TEXT NOT NULL,
    steps           INTEGER DEFAULT 0, 
    vm              REAL DEFAULT 0,
    peak_vm         REAL DEFAULT 0,
    hr              REAL DEFAULT 0,
    hrv             REAL DEFAULT 0,
    hrv_drop        REAL DEFAULT 0,
    hr_drop         REAL DEFAULT 0,
    hr_stability    REAL DEFAULT 0,
    sleep_score     REAL DEFAULT 0,
    interpolated    INTEGER DEAFAULT 0
    );
    `);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_sensor_packets_unix
    ON sensor_packets (unix);
    `);
  console.log("[db] tables ready");
}
export interface FoodLogRow {
  id: string;
  recipe_id?: string;
  recipe_name: string;
  timestamp: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calories?: number;
  is_liquid: boolean;
  image_url?: string;
}

export async function insertFoodLog(entry: FoodLogRow): Promise<void> {
  await getDB().runAsync(
    `INSERT OR REPLACE INTO food_log
        (if, recipe_id, recipe_name, timestamp, meal_type, protein, carbs, fat, fiber, calories, is_liquid, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.recipe_id ?? null,
      entry.recipe_name,
      entry.timestamp,
      entry.meal_type,
      entry.protein,
      entry.carbs,
      entry.fat,
      entry.fiber,
      entry.calories ?? 0,
      entry.is_liquid ? 1 : 0,
      entry.image_url ?? null,
    ],
  );
}
export async function getFoodLogForDay(dateStr: string): Promise<FoodLogRow[]> {
  const rows = await getDB().getAllAsync<any>(
    `SELECT * FROM food_log
        WHERE timestamp LIKE ?
        ORDER BY timestamp ASC`,
    [`${dateStr}%`],
  );
  return rows.map(rowToFoodLogEntry);
}
export async function deleteFoodLogEntry(id: string): Promise<void> {
  await getDB().runAsync(`DELETE FROM food_log WHERE id = ?`, [id]);
}
function rowToFoodLogEntry(row: any): FoodLogRow {
  return {
    id: row.id,
    recipe_id: row.recipe_id ?? undefined,
    recipe_name: row.recipe_name,
    timestamp: row.timestamp,
    meal_type: row.meal_type,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    calories: row.calories,
    is_liquid: row.is_liquid === 1,
    image_url: row.image_url ?? undefined,
  };
}
export interface SensorPacketRow {
  seq: number;
  unix: number;
  timestamp: string;
  steps: number;
  vm: number;
  peak_vm: number;
  hr: number;
  hrv: number;
  hrv_drop: number;
  hr_drop: number;
  hr_stability: number;
  sleep_score: number;
  interpolated: boolean;
}
export async function insertSensorPacket(
  packet: SensorPacketRow,
): Promise<void> {
  await getDB().runAsync(
    `INSERT OR IGNORE INTO sensor_packets
        (seq, unix, timestamp, steps, vm, peak_vm, hr, hrv, hrv_drop, hr_drop, hr_stability, sleep_score, interpolated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `,
    [
      packet.seq,
      packet.unix,
      packet.timestamp,
      packet.steps,
      packet.vm,
      packet.peak_vm,
      packet.hr,
      packet.hrv,
      packet.hrv_drop,
      packet.hr_drop,
      packet.hr_stability,
      packet.sleep_score,
      packet.interpolated ? 1 : 0,
    ],
  );
}
export async function insertSensorPacketBatch(
  packets: SensorPacketRow[],
): Promise<void> {
  const database = getDB();
  await database.withTransactionAsync(async () => {
    for (const packet of packets) {
      await insertSensorPacket(packet);
    }
  });
}
export async function getSensorPacketsInWindow(
  startUnix: number,
  endUnix: number,
): Promise<SensorPacketRow[]> {
  const rows = await getDB().getAllAsync<any>(
    `SELECT * FROM sensor_packets
        WHERE unix >= ? AND unix <= ?
        ORDER BY unix ASC`,
    [startUnix, endUnix],
  );
  return rows.map(rowToSensorPacket);
}
export async function getLatestSensorPacket(): Promise<SensorPacketRow | null> {
  const row = await getDB().getFirstAsync<any>(
    `SELECT * FROM sensor_packets ORDER BY unix DESC LIMIT 1`,
  );
  return row ? rowToSensorPacket(row) : null;
}
export async function pruneSensorPackets(keepDays: number = 30): Promise<void> {
  const cutoffUnix = Math.floor(Date.now() / 1000) - keepDays * 24 * 60 * 60;
  await getDB().runAsync(`DELETE FROM sensor_packets WHERE unix < ?`, [
    cutoffUnix,
  ]);
}
function rowToSensorPacket(row: any): SensorPacketRow {
  return {
    seq: row.seq,
    unix: row.unix,
    timestamp: row.timestamp,
    steps: row.steps,
    vm: row.vm,
    peak_vm: row.peak_vm,
    hr: row.hr,
    hrv: row.hrv,
    hrv_drop: row.hrv_drop,
    hr_drop: row.hr_drop,
    hr_stability: row.hr_stability,
    sleep_score: row.sleep_score,
    interpolated: row.interpolated === 1,
  };
}
