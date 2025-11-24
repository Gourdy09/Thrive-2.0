export type DayOfWeek = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface MedicationAlarm {
  id: string;
  time: string; // "HH:MM" format (24-hour for storage)
  enabled: boolean;
  days: DayOfWeek[]; // Days this alarm repeats
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  alarms: MedicationAlarm[];
  color: string;
  isActive: boolean;
}

export interface NextMedication {
  medication: Medication;
  alarm: MedicationAlarm;
  timeUntil: string;
  dayLabel: string; // e.g., "Today", "Tomorrow", or "Monday"
}

// Time utilities
export const convert24to12 = (time24: string): { hour: string; minute: string; period: 'AM' | 'PM' } => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return {
    hour: hour12.toString().padStart(2, '0'),
    minute: minutes,
    period
  };
};

export const convert12to24 = (hour: string, minute: string, period: 'AM' | 'PM'): string => {
  let hour24 = parseInt(hour);
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  return `${hour24.toString().padStart(2, '0')}:${minute}`;
};

export const formatTime12Hour = (time24: string): string => {
  const { hour, minute, period } = convert24to12(time24);
  return `${parseInt(hour)}:${minute} ${period}`;
};

export const getDayOfWeekIndex = (day: DayOfWeek): number => {
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.indexOf(day);
};

export const getDayLabel = (targetDate: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  if (targetDate.getTime() === today.getTime()) return 'Today';
  if (targetDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[targetDate.getDay()];
};