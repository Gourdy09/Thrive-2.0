import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

export default function EmptyMedicationsState() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 16,
        padding: 40,
        alignItems: "center",
        borderWidth: 2,
        borderColor: theme.border,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          color: theme.icon,
          textAlign: "center",
        }}
      >
        No medications added yet.{"\n"}Tap the + button to add your first medication.
      </Text>
    </View>
  );
}