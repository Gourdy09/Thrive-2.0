import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPicker({ colors, selectedColor, onSelectColor }: ColorPickerProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 8,
        }}
      >
        Color
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => onSelectColor(color)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: color,
              borderWidth: 3,
              borderColor: selectedColor === color ? theme.text : "transparent",
            }}
          />
        ))}
      </View>
    </View>
  );
}