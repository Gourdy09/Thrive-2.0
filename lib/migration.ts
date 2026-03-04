import * as SQLite from "expo-sqlite";

const DB_name = "glucose_app.db";
const SCHEMA_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_name);
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
  return db;
}
export async function runMigration(): Promise<void> {
  const database = await getDB();
  await database.execAsync(`
        CREATE TABLE IF NOT EXISTS _meta (
        key TEXT PRIMARY KEY,
        value TEXT);
        `);
  const row = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM _meta WHERE key = 'schema_version'`,
  );

  const currentVersion = row ? parseInt(row.value) : 0;
  if (currentVersion >= SCHEMA_VERSION) {
    return;
  }
  console.log(
    `[migration] upgrading from ${currentVersion} -> ${SCHEMA_VERSION}`,
  );
  await database.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await database.execAsync(`
                CREATE TABLE IF NOT EXISTS food_log (
          id TEXT PRIMARY KEY,
          recipe_id TEXT,
          recipe_name TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          meal_type TEXT NOT NULL,
          protein REAL NOT NULL DEFAULT 0,
          carbs REAL NOT NULL DEFAULT 0,
          fat REAL NOT NULL DEFAULT 0,
          fiber REAL NOT NULL DEFAULT 0,
          calories REAL DEFAULT 0,
          is_liquid INTEGER NOT NULL DEFAULT 0,
          image_url TEXT
        );
        `);
      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_food_log_timestamp
        ON food_log (timestamp);
        `);
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS sensor_packets(
          seq INTEGER PRIMARY KEY,
          unix INTEGER NOT NULL,
          timestamp TEXT NOT NULL,
          steps INTEGER DEFAULT 0,
          vm REAL DEFAULT 0,
          peak_vm REAL DEFAULT 0,
          hr REAL DEFAULT 0,
          hrv REAL DEFAULT 0,
          hrv_drop REAL DEFAULT 0,
          hr_drop REAL DEFAULT 0,
          hr_stability REAL DEFAULT 0,
          sleep_score REAL DEFAULT 0,
          interpolated INTEGER DEFAULT 0
        );
      `);
      await database.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_sensor_packets_unix
            ON sensor_packets (unix);
            `);
    }
    await database.runAsync(
      `
        INSERT OR REPLACE INTO _meta (key, value)
        VALUES ('schema_version', ?)`,
      [SCHEMA_VERSION.toString()],
    );
  });
  console.log("migration done");
}
