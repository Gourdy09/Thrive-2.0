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
    gender: 'Male' | 'Female';
  }
  
  export interface BluetoothDevice {
    id: string;
    name: string;
    rssi: number;
  }