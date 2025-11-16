import { NotificationSettings } from "@/types/notifications";
import { useEffect, useState } from "react";
import NotificationsScreen from "./NotificationsScreen";

export default function NotificationsContainer() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    // Alerts
    bloodSugarAlerts: true,
    medicationAlerts: true,
    paymentAlerts: true,
    
    // Blood Sugar Thresholds
    alertAbove: "",
    alertBelow: "",
    rapidRise: true,
    rapidFall: true,
    predictiveAlerts: false,
    
    // Device & Data Health
    sensorSignalLost: true,
    batteryLow: true,
    dataSyncError: true,
    
    // Reports & Insights
    dailySummary: true,
    weeklySummary: true,
    timeInRangeReport: false,
  });

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData: NotificationSettings = {
        bloodSugarAlerts: true,
        medicationAlerts: true,
        paymentAlerts: true,
        alertAbove: "180",
        alertBelow: "70",
        rapidRise: true,
        rapidFall: true,
        predictiveAlerts: false,
        sensorSignalLost: true,
        batteryLow: true,
        dataSyncError: true,
        dailySummary: true,
        weeklySummary: true,
        timeInRangeReport: false,
      };
      
      setSettings(mockData);
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: typeof settings[key] === "boolean" ? !settings[key] : settings[key],
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleSetThreshold = (key: "alertAbove" | "alertBelow", value: string) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const saveNotificationSettings = async (newSettings: NotificationSettings) => {
    try {
      // TODO: Save to Supabase
      console.log("Settings saved:", newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  if (loading) return null;

  return (
    <NotificationsScreen
      settings={settings}
      onToggle={handleToggle}
      onSetThreshold={handleSetThreshold}
    />
  );
}