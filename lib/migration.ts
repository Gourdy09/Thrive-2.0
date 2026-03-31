import { getDBHandle, initDB } from "./db";

const SCHEMA_VERSION = 2;

export async function runMigration(): Promise<void> {
  await initDB();
  const db = getDBHandle();

  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT);",
  );

  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM _meta WHERE key = 'schema_version'",
  );
  const currentVersion = row ? parseInt(row.value, 10) : 0;

  if (currentVersion >= SCHEMA_VERSION) {
    console.log(
      `[migration] schema already at v${currentVersion}, nothing to do`,
    );
    return;
  }

  console.log(
    `[migration] upgrading schema ${currentVersion} -> ${SCHEMA_VERSION}`,
  );

  // ── v1
  if (currentVersion < 1) {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS food_log (
         id          TEXT    PRIMARY KEY,
         recipe_id   TEXT,
         recipe_name TEXT    NOT NULL,
         timestamp   TEXT    NOT NULL,
         meal_type   TEXT    NOT NULL,
         protein     REAL    NOT NULL DEFAULT 0,
         carbs       REAL    NOT NULL DEFAULT 0,
         fat         REAL    NOT NULL DEFAULT 0,
         fiber       REAL    NOT NULL DEFAULT 0,
         calories    REAL             DEFAULT 0,
         is_liquid   INTEGER NOT NULL DEFAULT 0,
         image_url   TEXT
       );`,
    );

    await db.execAsync(
      "CREATE INDEX IF NOT EXISTS idx_food_log_timestamp ON food_log (timestamp);",
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS sensor_packets (
         seq          INTEGER PRIMARY KEY,
         unix         INTEGER NOT NULL,
         timestamp    TEXT    NOT NULL,
         steps        INTEGER DEFAULT 0,
         vm           REAL    DEFAULT 0,
         peak_vm      REAL    DEFAULT 0,
         hr           REAL    DEFAULT 0,
         hrv          REAL    DEFAULT 0,
         hrv_drop     REAL    DEFAULT 0,
         hr_drop      REAL    DEFAULT 0,
         hr_stability REAL    DEFAULT 0,
         sleep_score  REAL    DEFAULT 0,
         interpolated INTEGER DEFAULT 0
       );`,
    );

    await db.execAsync(
      "CREATE INDEX IF NOT EXISTS idx_sensor_packets_unix ON sensor_packets (unix);",
    );
  }

  // ── v2
  if (currentVersion < 2) {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS glucose_readings (
         id            TEXT    PRIMARY KEY,
         timestamp     TEXT    NOT NULL,
         unix          INTEGER NOT NULL,
         glucose_mg_dl REAL    NOT NULL,
         context       TEXT    NOT NULL DEFAULT 'other',
         meal_id       TEXT
       );`,
    );

    await db.execAsync(
      "CREATE INDEX IF NOT EXISTS idx_glucose_readings_unix ON glucose_readings (unix);",
    );

    await db.execAsync(
      "CREATE INDEX IF NOT EXISTS idx_glucose_readings_timestamp ON glucose_readings (timestamp);",
    );
  }
  await db.runAsync(
    "INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?);",
    [String(SCHEMA_VERSION)],
  );

  console.log(`[migration] done - schema is now v${SCHEMA_VERSION}`);
}
