import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NotificationSettings } from "@/types/notifications";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
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
  const { user } = useAuth();

  useEffect(() => {
    fetchNotificationSettings();
  }, [user]);

  const fetchNotificationSettings = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_info")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setSettings({
        bloodSugarAlerts: data?.bloodsugaralerts ?? false,
        medicationAlerts: data?.medicationalerts ?? false,
        paymentAlerts: data?.paymentalerts ?? false,
        rapidRise: data?.rapidrisealert ?? false,
        rapidFall: data?.rapidfallalert ?? false,
        predictiveAlerts: data?.predictiveh_l ?? false,
        sensorSignalLost: data?.sensorsignallost ?? false,
        batteryLow: data?.batterylost ?? false,
        dataSyncError: data?.datasyncoff ?? false,
        dailySummary: data?.dailysummary ?? false,
        weeklySummary: data?.weeklysummary ?? false,
        timeInRangeReport: data?.time_in_range ?? false,
        alertAbove: data?.alertabove ?? "",
        alertBelow: data?.alertbelow ?? "",
      });
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      Alert.alert("Error", "Failed to fetch notification settings");

      // fallback to all false if DB fetch fails
      setSettings({
        bloodSugarAlerts: false,
        medicationAlerts: false,
        paymentAlerts: false,
        rapidRise: false,
        rapidFall: false,
        predictiveAlerts: false,
        sensorSignalLost: false,
        batteryLow: false,
        dataSyncError: false,
        dailySummary: false,
        weeklySummary: false,
        timeInRangeReport: false,
        alertAbove: "",
        alertBelow: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]:
        typeof settings[key] === "boolean" ? !settings[key] : settings[key],
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const handleSetThreshold = (
    key: "alertAbove" | "alertBelow",
    value: string
  ) => {
    const newSettings = {
      ...settings,
      [key]: value,
    };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  const saveNotificationSettings = async (
    newSettings: NotificationSettings
  ) => {
    if (!user?.id) return;
    try {
      const { error: notificationsSaveError } = await supabase
        .from("user_info")
        .upsert(
          {
            id: user.id,
            bloodsugaralerts: newSettings.bloodSugarAlerts,
            medicationalerts: newSettings.medicationAlerts,
            paymentalerts: newSettings.paymentAlerts,
            rapidrisealert: newSettings.rapidRise,
            rapidfallalert: newSettings.rapidFall,
            predictiveh_l: newSettings.predictiveAlerts,
            sensorsignallost: newSettings.sensorSignalLost,
            batterylost: newSettings.batteryLow,
            datasyncoff: newSettings.dataSyncError,
            dailysummary: newSettings.dailySummary,
            weeklysummary: newSettings.weeklySummary,
            time_in_range: newSettings.timeInRangeReport,
            alertabove: newSettings.alertAbove
              ? parseInt(newSettings.alertAbove)
              : null,
            alertbelow: newSettings.alertBelow
              ? parseInt(newSettings.alertBelow)
              : null,
          },
          { onConflict: "id" }
        );
      if (notificationsSaveError) throw notificationsSaveError;
      console.log("Settings saved:", newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert("error", "Failed to save settings");
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
