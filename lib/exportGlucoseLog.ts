import { type GlucoseContext, getAllGlucoseReadings } from "./db";

const GLUCOSE_LOG_KEY = "glucose_log";

export interface GlucoseLogEntry {
  id: string;
  timestamp: string;
  glucose: number;
  context: GlucoseContext;
}

export interface ExportResult {
  entries: GlucoseLogEntry[];
  entryCount: number;
  exportedAt: string;
}

export async function exportGlucoseLog(): Promise<ExportResult> {
  const rows = await getAllGlucoseReadings();

  const entries: GlucoseLogEntry[] = rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    glucose: r.glucose_mg_dl,
    context: r.context,
  }));
  console.log(`[exportGlucoseLof] ${entries.length} fingerstick entires ready`);
  return {
    entries,
    entryCount: entries.length,
    exportedAt: new Date().toISOString(),
  };
}
