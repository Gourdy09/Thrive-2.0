import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, useColorScheme, View } from "react-native";
import OptionButton from "./OptionButton";

interface PreferencesSectionProps {
  glucoseUnit: "mg/dL" | "mmol/L";
  timeFormat: "12h" | "24h";
  theme: "light" | "dark" | "system";
  onGlucoseUnitChange: (unit: "mg/dL" | "mmol/L") => void;
  onTimeFormatChange: (format: "12h" | "24h") => void;
  onThemeChange: (theme: "light" | "dark" | "system") => void;
}

export default function PreferencesSection({
  glucoseUnit,
  timeFormat,
  theme,
  onGlucoseUnitChange,
  onTimeFormatChange,
  onThemeChange,
}: PreferencesSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const themeColors = Colors[colorScheme];

  return (
    <>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: themeColors.icon,
          marginBottom: 14,
          letterSpacing: -0.2,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        Preferences
      </Text>

      <View
        style={{
          backgroundColor: themeColors.cardBackground,
          borderColor: themeColors.border,
          borderWidth: 2,
          borderRadius: 16,
          marginBottom: 24,
          padding: 16,
        }}
      >
        {/* Glucose Unit */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: themeColors.text,
              marginBottom: 12,
            }}
          >
            Glucose Unit
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OptionButton
              label="mg/dL"
              selected={glucoseUnit === "mg/dL"}
              onPress={() => onGlucoseUnitChange("mg/dL")}
            />
            <OptionButton
              label="mmol/L"
              selected={glucoseUnit === "mmol/L"}
              onPress={() => onGlucoseUnitChange("mmol/L")}
            />
          </View>
        </View>

        {/* Time Format */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: themeColors.text,
              marginBottom: 12,
            }}
          >
            Time Format
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OptionButton
              label="12-hour"
              selected={timeFormat === "12h"}
              onPress={() => onTimeFormatChange("12h")}
            />
            <OptionButton
              label="24-hour"
              selected={timeFormat === "24h"}
              onPress={() => onTimeFormatChange("24h")}
            />
          </View>
        </View>

        {/* Theme */}
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: themeColors.text,
              marginBottom: 12,
            }}
          >
            Theme
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OptionButton
              label="Light"
              selected={theme === "light"}
              onPress={() => onThemeChange("light")}
            />
            <OptionButton
              label="Dark"
              selected={theme === "dark"}
              onPress={() => onThemeChange("dark")}
            />
            <OptionButton
              label="System"
              selected={theme === "system"}
              onPress={() => onThemeChange("system")}
            />
          </View>
        </View>
      </View>
    </>
  );
}