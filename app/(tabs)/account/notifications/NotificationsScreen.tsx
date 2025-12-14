import AlertsSection from "@/components/account/notifications/AlertsSection";
import BloodSugarThresholdsSection from "@/components/account/notifications/BloodSugarThresholdsSection";
import DeviceHealthSection from "@/components/account/notifications/DeviceHealthSection";
import ReportsSection from "@/components/account/notifications/ReportsSection";
import { Colors } from "@/constants/Colors";
import { NotificationSettings } from "@/types/notifications";
import { useRouter } from "expo-router";
import { ArrowLeft, Info } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface NotificationsScreenProps {
  settings: NotificationSettings;
  onToggle: (key: keyof NotificationSettings) => void;
  onSetThreshold: (key: "alertAbove" | "alertBelow", value: string) => void;
}

export default function NotificationsScreen({
  settings,
  onToggle,
  onSetThreshold,
}: NotificationsScreenProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background, marginTop: 32 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              padding: 8,
              marginLeft: -8,
              marginRight: 8,
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: theme.text,
            }}
          >
            Notifications
          </Text>
        </View>

        {/* Info Banner */}
        <View
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(66, 153, 225, 0.08)"
                : "rgba(66, 153, 225, 0.06)",
            borderWidth: 1,
            borderColor:
              colorScheme === "dark"
                ? "rgba(66, 153, 225, 0.2)"
                : "rgba(66, 153, 225, 0.15)",
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
            <View style={{ marginTop: 1 }}>
              <Info size={18} color={theme.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 13,
                  fontWeight: "500",
                  lineHeight: 19,
                  opacity: 0.9,
                }}
              >
                Manage alerts for blood sugar, medication reminders, device health, and reports.
              </Text>
            </View>
          </View>
        </View>

        {/* Alerts Section */}
        <AlertsSection
          bloodSugarAlerts={settings.bloodSugarAlerts}
          medicationAlerts={settings.medicationAlerts}
          paymentAlerts={settings.paymentAlerts}
          onToggle={onToggle}
        />

        {/* Blood Sugar Thresholds Section */}
        <BloodSugarThresholdsSection
          alertAbove={settings.alertAbove}
          alertBelow={settings.alertBelow}
          rapidRise={settings.rapidRise}
          rapidFall={settings.rapidFall}
          predictiveAlerts={settings.predictiveAlerts}
          onToggle={onToggle}
          onSetThreshold={onSetThreshold}
        />

        {/* Device & Data Health Section */}
        <DeviceHealthSection
          sensorSignalLost={settings.sensorSignalLost}
          batteryLow={settings.batteryLow}
          dataSyncError={settings.dataSyncError}
          onToggle={onToggle}
        />

        {/* Reports & Insights Section */}
        <ReportsSection
          dailySummary={settings.dailySummary}
          weeklySummary={settings.weeklySummary}
          timeInRangeReport={settings.timeInRangeReport}
          onToggle={onToggle}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}