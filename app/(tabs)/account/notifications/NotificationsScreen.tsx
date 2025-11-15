import BloodsugarNotification from "@/components/settings/notifications/BloodsugarNotification";
import NotificationToggle from "@/components/settings/notifications/NotificationToggle";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ArrowLeft, Info } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface NotificationsScreenProps {
  settings: {
    bloodSugarAlerts: boolean;
    medicationAlerts: boolean;
    paymentAlerts: boolean;
    bloodSugarThresholds: {
      above: number | null;
      below: number | null;
    };
  };
  onToggle: (key: keyof NotificationsScreenProps["settings"]) => void;
  onSetThreshold: (type: "above" | "below", value: number) => void;
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
    <View style={{ flex: 1, backgroundColor: theme.background, marginTop: 32 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
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
                Manage alerts for blood sugar, medication reminders, and payment updates.
              </Text>
            </View>
          </View>
        </View>

        {/* Notification Toggles */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 14,
            letterSpacing: -0.2,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Alerts
        </Text>

        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            borderWidth: 2,
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <NotificationToggle
            name="Blood Sugar Alerts"
            toggled={settings.bloodSugarAlerts}
            onToggle={() => onToggle("bloodSugarAlerts")}
          />
          <NotificationToggle
            name="Medication Alerts"
            toggled={settings.medicationAlerts}
            onToggle={() => onToggle("medicationAlerts")}
          />
          <NotificationToggle
            name="Payment Alerts"
            toggled={settings.paymentAlerts}
            onToggle={() => onToggle("paymentAlerts")}
          />
        </View>

        {/* Blood Sugar Threshold Settings */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 14,
            letterSpacing: -0.2,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Blood Sugar Thresholds
        </Text>

        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            borderWidth: 2,
            borderRadius: 16,
          }}
        >
          <BloodsugarNotification />
        </View>

        {/* Email Notifications */}
        
      </ScrollView>
    </View>
  );
}
