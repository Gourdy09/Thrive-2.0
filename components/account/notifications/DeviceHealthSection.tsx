import NotificationToggle from "@/components/account/notifications/NotificationToggle";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface DeviceHealthSectionProps {
  sensorSignalLost: boolean;
  batteryLow: boolean;
  dataSyncError: boolean;
  onToggle: (key: "sensorSignalLost" | "batteryLow" | "dataSyncError") => void;
}

export default function DeviceHealthSection({
  sensorSignalLost,
  batteryLow,
  dataSyncError,
  onToggle,
}: DeviceHealthSectionProps) {
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
        Device & Data Health
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
          name="Sensor Signal Lost"
          toggled={sensorSignalLost}
          onToggle={() => onToggle("sensorSignalLost")}
        />
        <NotificationToggle
          name="Battery Low"
          toggled={batteryLow}
          onToggle={() => onToggle("batteryLow")}
        />
        <NotificationToggle
          name="Data Sync Error"
          toggled={dataSyncError}
          onToggle={() => onToggle("dataSyncError")}
        />
      </View>
    </>
  );
}