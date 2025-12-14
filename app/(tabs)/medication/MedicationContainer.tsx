import { DayOfWeek, getDayLabel, Medication, NextMedication } from "@/types/medication";
import { useEffect, useState } from "react";
import MedicationScreen from "./MedicationScreen";

export default function MedicationContainer() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextMedication, setNextMedication] = useState<NextMedication | null>(null);

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    calculateNextMedication();
    // Update every minute
    const interval = setInterval(calculateNextMedication, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  const loadMedications = async () => {
    try {
      // TODO: Load from Supabase
      const allDays: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekdays: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      
      const mockMedications: Medication[] = [
        {
          id: "1",
          name: "Metformin",
          dosage: "500mg",
          instructions: "Take with breakfast",
          alarms: [
            { id: "a1", time: "08:00", enabled: true, days: allDays },
            { id: "a2", time: "20:00", enabled: true, days: allDays },
          ],
          color: "#4ECDC4",
          isActive: true,
        },
        {
          id: "2",
          name: "Insulin",
          dosage: "10 units",
          instructions: "Take before meals",
          alarms: [
            { id: "a3", time: "07:30", enabled: true, days: weekdays },
            { id: "a4", time: "12:30", enabled: true, days: allDays },
            { id: "a5", time: "18:30", enabled: true, days: allDays },
          ],
          color: "#FF6B6B",
          isActive: true,
        },
      ];
      setMedications(mockMedications);
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  };

  const calculateNextMedication = () => {
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextMed: NextMedication | null = null;
    let minDiff = Infinity;

    medications.forEach((medication) => {
      medication.alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        // Check each day in the alarm's repeat schedule
        for (let daysAhead = 0; daysAhead < 7; daysAhead++) {
          const checkDate = new Date(now);
          checkDate.setDate(checkDate.getDate() + daysAhead);
          const checkDayIndex = checkDate.getDay();
          
          // Get the day name for this index
          const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[checkDayIndex];
          
          // Check if this alarm is scheduled for this day
          if (!alarm.days.includes(dayName)) continue;

          const [hours, minutes] = alarm.time.split(":").map(Number);
          const alarmMinutes = hours * 60 + minutes;

          let diff: number;
          if (daysAhead === 0) {
            // Today
            diff = alarmMinutes - currentMinutes;
            if (diff < 0) continue; // Already passed today
          } else {
            // Future days
            diff = (daysAhead * 24 * 60) + alarmMinutes - currentMinutes;
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
    if (minutes < 60) {
      return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
      if (remainingMinutes === 0) {
        return `in ${hours} hour${hours !== 1 ? "s" : ""}`;
      }
      return `in ${hours}h ${remainingMinutes}m`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours === 0) {
      return `in ${days} day${days !== 1 ? "s" : ""}`;
    }
    return `in ${days}d ${remainingHours}h`;
  };

  const handleAddMedication = async (medication: Omit<Medication, "id">) => {
    try {
      const newMedication: Medication = {
        ...medication,
        id: Date.now().toString(),
      };

      // TODO: Save to Supabase
      setMedications([...medications, newMedication]);
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  const handleUpdateMedication = async (id: string, updates: Partial<Medication>) => {
    try {
      // TODO: Update in Supabase
      setMedications(
        medications.map((med) => (med.id === id ? { ...med, ...updates } : med))
      );
    } catch (error) {
      console.error("Error updating medication:", error);
    }
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      // TODO: Delete from Supabase
      setMedications(medications.filter((med) => med.id !== id));
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const handleToggleAlarm = async (medicationId: string, alarmId: string, enabled: boolean) => {
    try {
      // TODO: Update in Supabase
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