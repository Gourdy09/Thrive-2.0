import AsyncStorage from "@react-native-async-storage/async-storage";

const GLUCOSE_LOG_KEY = "glucose_log";

export interface GlucoseLogEntry {
  id: string;
  timestamp: string;
  glucose: number;
  context: "wake_up" | "pre_meal" | "post_meal_60" | "other";
  entryType?: string;
}

export interface ExportResult {
  entries: GlucoseLogEntry[];
  entryCount: number;
  exportedAt: string;
}

export async function exportGlucoseLog(): Promise<ExportResult> {
  const raw = await AsyncStorage.getItem(GLUCOSE_LOG_KEY);
  const stored: any[] = raw ? JSON.parse(raw) : [];

  const entries: GlucoseLogEntry[] = stored.map((e) => ({
    id: e.id ?? "",
    timestamp: e.timestamp ?? new Date().toISOString(),
    glucose: Number(e.glucose ?? e.glucose_mg_dl ?? 0),
    context: normaliseContext(e.context ?? e.entryType ?? "other"),
  }));

  console.log(`[exportGlucoseLog] ${entries.length} fingerstick entries ready`);

  return {
    entries,
    entryCount: entries.length,
    exportedAt: new Date().toISOString(),
  };
}

function normaliseContext(raw: string): GlucoseLogEntry["context"] {
  const s = raw.toLowerCase().trim();
  if (s === "wake_up" || s === "wake up" || s === "wakeup") return "wake_up";
  if (s === "pre_meal" || s === "pre-meal" || s === "premeal")
    return "pre_meal";
  if (s.includes("post") && s.includes("60")) return "post_meal_60";
  return "other";
}
