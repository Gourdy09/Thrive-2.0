import { Colors } from "@/constants/Colors";
import { DayOfWeek } from "@/types/medication";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface DaySelectorProps {
  selectedDays: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
}

export default function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const allDays: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      // Remove day if already selected
      const newDays = selectedDays.filter(d => d !== day);
      // Ensure at least one day is selected
      if (newDays.length > 0) {
        onChange(newDays);
      }
    } else {
      // Add day
      onChange([...selectedDays, day]);
    }
  };

  return (
    <View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: theme.icon,
          marginBottom: 8,
        }}
      >
        Repeat on
      </Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        {allDays.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <TouchableOpacity
              key={day}
              onPress={() => toggleDay(day)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isSelected
                  ? theme.tint
                  : colorScheme === "dark"
                  ? "#1c1e22"
                  : "#f8f9fa",
                borderWidth: 2,
                borderColor: isSelected ? theme.tint : theme.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: isSelected ? theme.background : theme.text,
                  fontSize: 14,
                  fontWeight: isSelected ? "700" : "600",
                }}
              >
                {day.charAt(0)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}