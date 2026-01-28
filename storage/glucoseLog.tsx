import AsyncStorage from "@react-native-async-storage/async-storage";

export type GlucoseEntry = {
  glucose_mg_dl: number;
  timestamp: string;
  context: string[];
};

const STORAGE_KEY = "glucose_log";
const dayKey = (date = new Date()) => date.toISOString().split("T")[0];

export const addGlucoseEntry = async (
  entry: Omit<GlucoseEntry, "timestamp">,
) => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const entries: GlucoseEntry[] = jsonValue ? JSON.parse(jsonValue) : [];

    const newEntry: GlucoseEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    entries.push(newEntry);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    return newEntry;
  } catch (error) {
    console.error("Error adding glucose entry:", error);
    throw error;
  }
};
export const getGlucoseLog = async (): Promise<GlucoseEntry[]> => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};
/*
const log = await getGlucoseLog();
console.log(log.length); // 0 if nothing saved
 */
