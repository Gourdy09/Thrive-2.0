import { MedDurationModel } from "@/components/ai_medication/med_class";
import { supabase } from "@/lib/supabase";
import { AppSettings } from "@/types/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface foodLogEntry {
  id: string;
  recipeName: string;
  timestamp: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  nutrition: {
    protein: number;
    carbs: number;
    calories?: number;
    fiber: number;
    fat: number;
  };
  imageUrl?: string;
  is_liquid: boolean;
}
interface InsulinMedication {
  units: number;
  time: number;
  type: string;
}
interface medication {
  med_id: string;
  dose: number;
  t_k: number;
  med_class: string | undefined;
}
interface MedicationRow {
  id: string;
  medication_name: string;
  med_class?: string;
  dosage: string;
}
const fetchInsulinMedication = async (
  userId: string,
): Promise<InsulinMedication[]> => {
  try {
    const { data: meds, error: medError } = await supabase
      .from("medication")
      .select("id, medication_name, dosage")
      .eq("user_id", userId)
      .eq("isActive", true)
      .ilike("medication_name", "%insulin%");

    if (medError) throw medError;

    const insulinMeds: InsulinMedication[] = [];

    for (const med of meds || []) {
      const dosageMatch = med.dosage?.match(/(\d+)/);
      const units = dosageMatch ? parseFloat(dosageMatch[1]) : 0;

      const { data: alerts, error: alertsError } = await supabase
        .from("medicine_alerts") // Changed from medication_alerts
        .select("time")
        .eq("medication_id", med.id)
        .eq("enabled", true);

      if (alertsError) throw alertsError;

      for (const alert of alerts || []) {
        const [hour, minutes] = alert.time.split(":").map(Number); // Changed .mao to .map
        insulinMeds.push({
          units,
          time: hour + minutes / 60,
          type: med.medication_name,
        });
      }
    }
    return insulinMeds;
  } catch (error) {
    console.error("Error fetching insulin medications:", error);
    return [];
  }
};
const fetchMedication = async (userId: string): Promise<medication[]> => {
  try {
    const { data: medsData, error: medError } = await supabase
      .from("medication")
      .select("id, medication_name, dosage, med_class")
      .eq("user_id", userId)
      .eq("isActive", true);

    if (medError) throw medError;
    if (!medsData) return [];

    const meds: MedicationRow[] = medsData;
    const medsWithClass = MedDurationModel.assignMedClassToRows(meds);
    const Meds: medication[] = [];

    for (const med of medsWithClass || []) {
      const dosageMatch = med.dosage?.match(/(\d+)/);
      if (!dosageMatch) continue;
      const dose = Number(dosageMatch[1]);

      const { data: alerts, error: alertsError } = await supabase
        .from("medicine_alerts")
        .select("time")
        .eq("medication_id", med.id)
        .eq("enabled", true);

      if (alertsError) throw alertsError;

      for (const alert of alerts || []) {
        const [hour, minutes] = alert.time.split(":").map(Number);
        Meds.push({
          med_id: String(med.id),
          t_k: hour + minutes / 60,
          dose: dose,
          med_class: med.med_class,
        });
      }
    }
    return Meds;
  } catch (error) {
    console.error("Error fetching medications:", error);
    return [];
  }
};
export const glucoseSimulationService = {
  async runSimulation(settings: AppSettings, userId: string) {
    try {
      const stored = await AsyncStorage.getItem("foodLog");
      const foodLog: foodLogEntry[] = stored ? JSON.parse(stored) : [];

      //format
      const meals = foodLog.map((entry) => {
        const entryTime = new Date(entry.timestamp);
        const hours = entryTime.getHours() + entryTime.getMinutes() / 60;
        const fatprotein =
          (entry.nutrition.fat + entry.nutrition.protein) /
          (entry.nutrition.fat +
            entry.nutrition.protein +
            entry.nutrition.carbs);
        return {
          carbs: entry.nutrition.carbs,
          t_meal: hours,
          fiber_ratio: 0.1,
          is_liquid: entry.is_liquid,
          fatprotein: fatprotein,
        };
      });
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
