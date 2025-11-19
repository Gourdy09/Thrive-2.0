import { Colors } from "@/constants/Colors";
import { Text, TouchableOpacity, useColorScheme } from "react-native";

export default function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: selected ? theme.tint : theme.border,
        backgroundColor: selected
          ? colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.02)"
          : "transparent",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: selected ? theme.tint : theme.text,
          fontWeight: selected ? "700" : "500",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}