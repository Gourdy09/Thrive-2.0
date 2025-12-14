export interface NotificationSettings {
    // Alerts
    bloodSugarAlerts: boolean;
    medicationAlerts: boolean;
    paymentAlerts: boolean;
    
    // Blood Sugar Thresholds
    alertAbove: string;
    alertBelow: string;
    rapidRise: boolean;
    rapidFall: boolean;
    predictiveAlerts: boolean;
    
    // Device & Data Health
    sensorSignalLost: boolean;
    batteryLow: boolean;
    dataSyncError: boolean;
    
    // Reports & Insights
    dailySummary: boolean;
    weeklySummary: boolean;
    timeInRangeReport: boolean;
  }