import { Colors } from "@/constants/Colors";
import {
  ChevronDown,
  ChevronUp,
  Droplet,
} from "lucide-react-native";
import React from "react";
import { Text, View, useColorScheme } from "react-native";

interface DashboardHeaderProps {
    bloodGlucoseLevel: number;
    units: string;
    deltaSugar: number;
    expectedChange: number;
}

export default function DashboardHeader({bloodGlucoseLevel, units, deltaSugar, expectedChange}: DashboardHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const Username = "{UserName}";
  return (
    <View
      style={{
        borderColor: theme.tint,
        borderWidth: 2,
        borderRadius: 16,
        padding: 20,
        backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
      }}
    >
      {/* Report Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Droplet color={theme.tint} size={20} />
        <Text
          style={{
            color: theme.text,
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          Blood Report
        </Text>
      </View>

      {/* Description */}
      <Text
        style={{
          color: theme.text,
          fontSize: 14,
          opacity: 0.85,
          marginBottom: 10,
        }}
      >
        Your current blood glucose level is
      </Text>

      {/* Glucose Reading */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: theme.text,
            fontSize: 40,
            fontWeight: "bold",
            fontFamily: "monospace",
            letterSpacing: -1,
          }}
        >
          {bloodGlucoseLevel.toString().padStart(3, "0")}
        </Text>
        <Text
          style={{
            color: theme.text,
            fontSize: 22,
            marginLeft: 10,
            opacity: 0.9,
          }}
        >
          {units}
        </Text>
      </View>

      {/* Delta sugar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        {deltaSugar < 0 ? (
          <ChevronDown color={theme.icon} size={14} />
        ) : (
          <ChevronUp color={theme.icon} size={14} />
        )}
        <Text
          style={{
            color: theme.text,
            fontSize: 14,
            marginLeft: 6,
            opacity: 0.6,
          }}
        >
          {Math.abs(deltaSugar).toFixed(2)} {units} from last 2 hours
        </Text>
      </View>

      {/* Expected sugar change */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            color: theme.text,
            fontSize: 14,
            opacity: 0.6,
            marginRight: 4,
          }}
        >
          Expected
        </Text>
        {expectedChange < 0 ? (
          <ChevronDown color={theme.icon} size={14} />
        ) : (
          <ChevronUp color={theme.icon} size={14} />
        )}
        <Text
          style={{
            color: theme.text,
            fontSize: 14,
            opacity: 0.6,
            marginLeft: 4,
          }}
        >
          {expectedChange.toString().padStart(3, "0")} {units} in the next 2
          hours
        </Text>
      </View>
    </View>
  );
}
