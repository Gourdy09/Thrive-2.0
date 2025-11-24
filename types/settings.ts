export interface CGMDevice {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  batteryLevel: number;
  lastSync: Date;
  isConnected: boolean;
  isActive: boolean;
}

export interface YouSettings {
  birthdate: string;
  gender: "Male" | "Female";
  race: string;
  diabetesType: "Type 1" | "Type 2" | "Prediabetes" | "None";
  baselineGlucose: string;
  height: string;
  weight: string;
  activityLevel: "Sedentary" | "Light" | "Moderate" | "Active" | "Very Active";
  dietaryRestrictions: string[];
}

export interface AppSettings {
  // Account
  email: string;

  // Preferences
  glucoseUnit: 'mg/dL' | 'mmol/L';
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';

  // Devices
  connectedDevices: CGMDevice[];

  // You
  you: YouSettings;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
}