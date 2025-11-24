export interface MedicationAlarm {
  id: string;
  time: string; // "HH:MM" format
  enabled: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  alarms: MedicationAlarm[];
  color: string; // For visual distinction
  isActive: boolean;
}

export interface NextMedication {
  medication: Medication;
  alarm: MedicationAlarm;
  timeUntil: string; // e.g., "in 2 hours" or "in 30 minutes"
}