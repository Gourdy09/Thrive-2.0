import {
  getAllGlucoseReadings,
  getGlucoseReadingsForDay,
  getLatestGlucoseReading,
  insertGlucoseReading,
  type GlucoseContext,
  type GlucoseReadingRow,
} from "@/lib/db";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export type { GlucoseReadingRow as GlucoseEntry };

/**
 * Persist one fingerstick reading to SQLite and return the saved row.
 *
 * @param entry.glucose_mg_dl
 * @param entry.context
 * @param entry.meal_id
 */
export async function addGlucoseEntry(entry: {
  glucose_mg_dl: number;
  context?: GlucoseContext;
  meal_id?: string;
}): Promise<GlucoseReadingRow> {
  const now = new Date();
  const row: GlucoseReadingRow = {
    id: uuidv4(),
    timestamp: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    glucose_mg_dl: entry.glucose_mg_dl,
    context: entry.context ?? "other",
    meal_id: entry.meal_id,
  };

  await insertGlucoseReading(row);
  return row;
}

export async function getGlucoseLog(): Promise<GlucoseReadingRow[]> {
  return getAllGlucoseReadings();
}

//  (YYYY-MM-DD)
export async function getGlucoseLogForDay(
  dateStr: string,
): Promise<GlucoseReadingRow[]> {
  return getGlucoseReadingsForDay(dateStr);
}

/*
  Returns the number of seconds since the most recent fingerstick,
  or Infinity if no readings exist yet.
 */
export async function secondsSinceLastReading(): Promise<number> {
  const latest = await getLatestGlucoseReading();
  if (!latest) return Infinity;
  return Math.floor(Date.now() / 1000) - latest.unix;
}
