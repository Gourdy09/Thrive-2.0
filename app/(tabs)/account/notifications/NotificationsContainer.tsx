import { useEffect, useState } from "react";
import NotificationsScreen from "./NotificationsScreen";

interface NotificationSettings {
  bloodSugarAlerts: boolean;
  medicationAlerts: boolean;
  paymentAlerts: boolean;
  bloodSugarThresholds: {
    above: number | null;
    below: number | null;
  };
}

export default function NotificationsContainer() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    bloodSugarAlerts: true,
    medicationAlerts: true,
    paymentAlerts: true,
    bloodSugarThresholds: { above: null, below: null },
    
  });

  useEffect(() => {
    // TODO: Fetch from Supabase or local storage
    setLoading(false);
  }, []);

  const handleToggle = (key: keyof NotificationSettings) => {
    if (typeof settings[key] === "boolean") {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSetThreshold = (type: "above" | "below", value: number | null) => {
    setSettings(prev => ({
      ...prev,
      bloodSugarThresholds: { ...prev.bloodSugarThresholds, [type]: value },
    }));
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
