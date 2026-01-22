import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  DayOfWeek,
  getDayLabel,
  Medication,
  NextMedication,
} from "@/types/medication";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import MedicationScreen from "./MedicationScreen";

export default function MedicationContainer() {
  const [nextMedication, setNextMedication] = useState<NextMedication | null>(
    null
  );
  const { user } = useAuth();
  const allDays: DayOfWeek[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  const weekdays: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    loadMedications();
  }, [user]);

  useEffect(() => {
    calculateNextMedication();
    // Update every minute to recalculate next medication
    const interval = setInterval(() => {
      calculateNextMedication();
    }, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  const loadMedications = async () => {
    if (!user?.id) return;

    try {
      const { data: medicineData, error } = await supabase
        .from("medication")
        .select(
          `
        id,
        medication_name,
        dosage,
        instructions,
        isActive,
        medicine_alerts (
          id,
          time,
          enabled,
          days_of_week,
          color
        )
      `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const mapped: Medication[] =
        medicineData?.map((med) => ({
          id: med.id,
          name: med.medication_name,
          dosage: med.dosage,
          instructions: med.instructions,
          isActive: med.isActive ?? true, // default to true if null
          color: med.medicine_alerts?.[0]?.color ?? "#4ECDC4",
          alarms: med.medicine_alerts.map((alarm) => ({
            id: alarm.id,
            time: alarm.time.slice(0, 5),
            enabled: alarm.enabled,
            days: alarm.days_of_week.map(
              (d: number) =>
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]
            ),
          })),
        })) ?? [];
      setMedications(mapped);
    } catch (error) {
      console.error("Error loading medications:", error);
      Alert.alert("Error", "Failed to load medications");
    }
  };

  const calculateNextMedication = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextMed: NextMedication | null = null;
    let minDiff = Infinity;

    medications.forEach((medication) => {
      if (!medication.isActive) return; // Skip inactive medications

      medication.alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        // Check each day in the alarm's repeat schedule
        for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
          const checkDate = new Date(now);
          checkDate.setDate(checkDate.getDate() + daysAhead);
          const checkDayIndex = checkDate.getDay();

          const dayNames: DayOfWeek[] = [
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ];
          const dayName = dayNames[checkDayIndex];

          if (!alarm.days.includes(dayName)) continue;

          const [hours, minutes] = alarm.time.split(":").map(Number);
          const alarmMinutes = hours * 60 + minutes;

          let diff: number;
          if (daysAhead === 0) {
            diff = alarmMinutes - currentMinutes;
            if (diff < 0) continue;
          } else {
            diff = daysAhead * 24 * 60 + alarmMinutes - currentMinutes;
          }

          if (diff >= 0 && diff < minDiff) {
            minDiff = diff;
            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + daysAhead);

            nextMed = {
              medication,
              alarm,
              timeUntil: formatTimeUntil(diff),
              dayLabel: getDayLabel(targetDate),
            };
          }
        }
      });
    });

    setNextMedication(nextMed);
  };

  const formatTimeUntil = (minutes: number): string => {
    if (minutes < 60) return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      if (remainingMinutes === 0)
        return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
      return `in ${hours}h ${remainingMinutes}m`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (remainingHours === 0) return `in ${days} day${days !== 1 ? "s" : ""}`;
    return `in ${days}d ${remainingHours}h`;
  };

  const handleAddMedication = async (medication: Omit<Medication, "id">) => {
    if (!user?.id) return;
    try {
      const { data: medData, error: medError } = await supabase
        .from("medication")
        .insert({
          user_id: user.id,
          medication_name: medication.name,
          dosage: medication.dosage,
          instructions: medication.instructions,
          isActive: true,
        })
        .select()
        .single();

      if (medError) throw medError;

      const alarmsDataLoad = medication.alarms.map((alarm) => ({
        medication_id: medData.id,
        time: alarm.time,
        enabled: alarm.enabled,
        days_of_week: alarm.days.map((d) =>
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d)
        ),
        color: medication.color,
      }));

      const { error: alarmError } = await supabase
        .from("medicine_alerts")
        .insert(alarmsDataLoad);
      if (alarmError) throw alarmError;

      setMedications((prev) => [
        ...prev,
        {
          ...medData,
          color: medication.color,
          alarms: medication.alarms,
          isActive: true,
        },
      ]);
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  const handleUpdateMedication = async (
    id: string,
    updates: Partial<Medication>
  ) => {
    try {
      const updatePayload: any = {};
      if (updates.name) updatePayload.medication_name = updates.name;
      if (updates.dosage) updatePayload.dosage = updates.dosage;
      if (updates.instructions !== undefined)
        updatePayload.instructions = updates.instructions;
      if (updates.isActive !== undefined)
        updatePayload.isActive = updates.isActive;

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await supabase
          .from("medication")
          .update(updatePayload)
          .eq("id", id);
        if (error) throw error;
      }

      if (updates.alarms) {
        const { error: deleteError } = await supabase
          .from("medicine_alerts")
          .delete()
          .eq("medication_id", id);
        if (deleteError) throw deleteError;

        const alarmsDataload = updates.alarms.map((alarm) => ({
          medication_id: id,
          time: alarm.time,
          enabled: alarm.enabled,
          days_of_week: alarm.days.map((d) =>
            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d)
          ),
          color: updates.color,
        }));

        const { error: insertError } = await supabase
          .from("medicine_alerts")
          .insert(alarmsDataload);
        if (insertError) throw insertError;
      }

      setMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, ...updates } : med))
      );
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!user?.id) return;
    try {
      const { error: medDelerror } = await supabase
        .from("medication")
        .delete()
        .eq("id", id);
      if (medDelerror) throw medDelerror;

      setMedications(medications.filter((med) => med.id !== id));
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const handleToggleAlarm = async (
    medicationId: string,
    alarmId: string,
    enabled: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("medicine_alerts")
        .update({ enabled })
        .eq("id", alarmId);
      if (error) throw error;

      setMedications(
        medications.map((med) => {
          if (med.id === medicationId) {
            return {
              ...med,
              alarms: med.alarms.map((alarm) =>
                alarm.id === alarmId ? { ...alarm, enabled } : alarm
              ),
            };
          }
          return med;
        })
      );
    } catch (error) {
      console.error("Error toggling alarm:", error);
    }
  };

  return (
    <MedicationScreen
      medications={medications}
      nextMedication={nextMedication}
      onAddMedication={handleAddMedication}
      onUpdateMedication={handleUpdateMedication}
      onDeleteMedication={handleDeleteMedication}
      onToggleAlarm={handleToggleAlarm}
    />
  );
}
