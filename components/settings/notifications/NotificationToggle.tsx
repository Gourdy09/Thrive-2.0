import { Colors } from "@/constants/Colors";
import React from "react";
import { Switch, Text, useColorScheme, View } from "react-native";

interface NotificationToggleProps {
  name: string;
  toggled: boolean;
  onToggle: () => void;
}

export default function NotificationToggle({
  name,
  toggled,
  onToggle,
}: NotificationToggleProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1.5,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text, fontWeight: "500" }}>{name}</Text>
      <Switch
        trackColor={{ false: theme.shadow, true: theme.toggled }}
        thumbColor={"#d4d4d8"}
        onValueChange={onToggle}
        value={toggled}
      />
    </View>
  );
}
