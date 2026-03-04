//import { MedDurationModel } from "@/components/ai_medication/med_class";
import { AppSettings } from "@/types/settings";
import * as SQLite from "expo-sqlite";
interface FoodLogRow {
  id: string;
  timestamp: string;
  carbs: number;
  fat: number;
  protein: number;
  fiber: number;
  is_liquid: number;
}
interface SensorPacketRow {
  hr: number;
  hrv: number;
  vm: number;
  sleep_score: number;
  unix: number;
  interpolated: number;
}
interface SimulationResult {
  glucoseTrajectory: number[];
  peakGlucose: number;
  averageGlucose: number;
  timePoints: number[];
}

async function fetchMealFromSQLite() {
  const db = await SQLite.openDatabaseAsync("glucose_app.db");
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rows = await db.getAllAsync<FoodLogRow>(
    `SELECT id, timestamp, carbs, fat, protein, fiber, is_liquid
    FROM food_log
    WHERE carbs > 0 AND timestamp >= ?
    ORDER BY timestamp ASC`,
    [since],
  );
  return rows.map((row) => {
    const entryTime = new Date(row.timestamp);
    const hours = entryTime.getHours() + entryTime.getMinutes() / 60;
    const totalMacro = row.carbs + row.fat + row.protein;
    const fatprotein =
      totalMacro > 0 ? (row.fat + row.protein) / totalMacro : 0.2;
    const fiber_ratio = row.carbs > 0 ? row.fiber / row.carbs : 0.1;

    return {
      carbs: row.carbs,
      t_meal: hours,
      fiber_ratio,
      is_liquid: Boolean(row.is_liquid),
      fatprotein,
    };
  });
}
async function fetchSensorPacketsFromSQLite() {
  const db = await SQLite.openDatabaseAsync("glucose_app.db");
  const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

  const rows = await db.getAllAsync<SensorPacketRow>(
    `SELECT hr, hrv, vm, sleep_score, unix, interpolated
    FROM sensor_packets
    WHERE unix >= ?
    ORDER BY unix ASC`,
    [since],
  );
  return rows.map((row) => ({
    hr: row.hr,
    hrv: row.hrv,
    vm: row.vm,
    sleep_score: row.sleep_score,
    unix: row.unix,
    interpolated: Boolean(row.interpolated),
  }));
}
export const glucoseSimulationService = {
  async runSimulation(
    settings: AppSettings,
    userId: string,
  ): Promise<SimulationResult> {
    try {
      const meals = await fetchMealFromSQLite();
      const activity = await fetchSensorPacketsFromSQLite();

      const EXPO_PUBLIC_GLUCOSE_API_URL =
        process.env.EXPO_PUBLIC_GLUCOSE_API_URL;

      const response = await fetch(
        EXPO_PUBLIC_GLUCOSE_API_URL + "/simulate-glucose",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            meals,
            activity,
            G_b: settings.you.baselineGlucose,
            insulin: settings.you.insulin,
            insulinType: settings.you.insulinType,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("APi error: ${response.statusText}");
      }
      const result = await response.json();
      return {
        glucoseTrajectory: result.glucoseTrajectory,
        peakGlucose: result.peakGlucose,
        averageGlucose: result.averageGlucose,
        timePoints: result.timePoints,
      };
    } catch (error) {
      console.error("Error running glucose simulation:  ", error);
      throw error;
    }
  },
};
