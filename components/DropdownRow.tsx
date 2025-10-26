import { Colors } from "@/constants/Colors";
import { ChevronDown } from "lucide-react-native";
import { Pressable, Text, TouchableOpacity, useColorScheme, View } from "react-native";
export default function DropdownRow({
  label,
  value,
  options,
  open,
  onOpen,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  open: boolean;
  onOpen: () => void;
  onSelect: (val: string) => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View>
      <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>
        {label}
      </Text>

      <Pressable
        onPress={onOpen}
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: theme.tint,
          borderRadius: 12,
          padding: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f1f3f4",
        }}
      >
        <Text style={{ color: theme.text }}>{value}</Text>
        <ChevronDown color={theme.icon} size={18} />
      </Pressable>

      {open && (
        <View
          style={{
            marginTop: 8,
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#fff",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.tint,
            overflow: "hidden",
          }}
        >
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt)}
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
            >
              <Text style={{ color: theme.text }}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
