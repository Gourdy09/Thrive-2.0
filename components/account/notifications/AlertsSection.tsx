import NotificationToggle from "@/components/account/notifications/NotificationToggle";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface AlertsSectionProps {
  bloodSugarAlerts: boolean;
  medicationAlerts: boolean;
  paymentAlerts: boolean;
  onToggle: (key: "bloodSugarAlerts" | "medicationAlerts" | "paymentAlerts") => void;
}

export default function AlertsSection({
  bloodSugarAlerts,
  medicationAlerts,
  paymentAlerts,
  onToggle,
}: AlertsSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <>
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
          toggled={bloodSugarAlerts}
          onToggle={() => onToggle("bloodSugarAlerts")}
        />
        <NotificationToggle
          name="Medication Alerts"
          toggled={medicationAlerts}
          onToggle={() => onToggle("medicationAlerts")}
        />
        <NotificationToggle
          name="Payment Alerts"
          toggled={paymentAlerts}
          onToggle={() => onToggle("paymentAlerts")}
        />
      </View>
    </>
  );
}