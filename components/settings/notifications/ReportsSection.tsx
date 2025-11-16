import NotificationToggle from "@/components/settings/notifications/NotificationToggle";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface ReportsSectionProps {
  dailySummary: boolean;
  weeklySummary: boolean;
  timeInRangeReport: boolean;
  onToggle: (key: "dailySummary" | "weeklySummary" | "timeInRangeReport") => void;
}

export default function ReportsSection({
  dailySummary,
  weeklySummary,
  timeInRangeReport,
  onToggle,
}: ReportsSectionProps) {
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
        Reports & Insights
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
          name="Daily Summary"
          toggled={dailySummary}
          onToggle={() => onToggle("dailySummary")}
        />
        <NotificationToggle
          name="Weekly Summary"
          toggled={weeklySummary}
          onToggle={() => onToggle("weeklySummary")}
        />
        <NotificationToggle
          name="Time-in-Range Report"
          toggled={timeInRangeReport}
          onToggle={() => onToggle("timeInRangeReport")}
        />
      </View>
    </>
  );
}