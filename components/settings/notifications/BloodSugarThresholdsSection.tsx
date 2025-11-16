import NotificationToggle from "@/components/settings/notifications/NotificationToggle";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import { Text, TextInput, useColorScheme, View } from "react-native";

interface BloodSugarThresholdsSectionProps {
  alertAbove: string;
  alertBelow: string;
  rapidRise: boolean;
  rapidFall: boolean;
  predictiveAlerts: boolean;
  onToggle: (key: "rapidRise" | "rapidFall" | "predictiveAlerts") => void;
  onSetThreshold: (key: "alertAbove" | "alertBelow", value: string) => void;
}

export default function BloodSugarThresholdsSection({
  alertAbove,
  alertBelow,
  rapidRise,
  rapidFall,
  predictiveAlerts,
  onToggle,
  onSetThreshold,
}: BloodSugarThresholdsSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const units = "mg/dL";

  const [isAboveActive, setIsAboveActive] = useState(false);
  const [isBelowActive, setIsBelowActive] = useState(false);

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
        Blood Sugar Thresholds
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
        {/* Alert Above */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderBottomWidth: 1.5,
            borderBottomColor: theme.border,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
            Alert Above:
          </Text>
          <TextInput
            value={alertAbove}
            onChangeText={(text) => onSetThreshold("alertAbove", text.replace(/[^0-9]/g, ""))}
            onFocus={() => setIsAboveActive(true)}
            onBlur={() => setIsAboveActive(false)}
            keyboardType="numeric"
            maxLength={3}
            placeholder="000"
            placeholderTextColor={theme.icon}
            style={{
              color: theme.text,
              fontSize: 16,
              textAlign: "center",
              borderBottomWidth: 2,
              borderBottomColor: isAboveActive ? theme.tint : theme.border,
              backgroundColor: theme.background,
              width: 70,
              marginRight: 8,
              borderRadius: 8,
              paddingVertical: 4,
            }}
          />
          <Text style={{ color: theme.text, fontSize: 15 }}>{units}</Text>
        </View>

        {/* Alert Below */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderBottomWidth: 1.5,
            borderBottomColor: theme.border,
          }}
        >
          <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
            Alert Below:
          </Text>
          <TextInput
            value={alertBelow}
            onChangeText={(text) => onSetThreshold("alertBelow", text.replace(/[^0-9]/g, ""))}
            onFocus={() => setIsBelowActive(true)}
            onBlur={() => setIsBelowActive(false)}
            keyboardType="numeric"
            maxLength={3}
            placeholder="000"
            placeholderTextColor={theme.icon}
            style={{
              color: theme.text,
              fontSize: 16,
              textAlign: "center",
              borderBottomWidth: 2,
              borderBottomColor: isBelowActive ? theme.tint : theme.border,
              backgroundColor: theme.background,
              width: 70,
              marginRight: 8,
              borderRadius: 8,
              paddingVertical: 4,
            }}
          />
          <Text style={{ color: theme.text, fontSize: 15 }}>{units}</Text>
        </View>

        {/* Rapid Rise Alert */}
        <NotificationToggle
          name="Rapid Rise Alert"
          toggled={rapidRise}
          onToggle={() => onToggle("rapidRise")}
        />

        {/* Rapid Fall Alert */}
        <NotificationToggle
          name="Rapid Fall Alert"
          toggled={rapidFall}
          onToggle={() => onToggle("rapidFall")}
        />

        {/* Predictive High/Low */}
        <NotificationToggle
          name="Predictive High/Low"
          toggled={predictiveAlerts}
          onToggle={() => onToggle("predictiveAlerts")}
        />
      </View>
    </>
  );
}