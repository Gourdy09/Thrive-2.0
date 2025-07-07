import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 24 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <ArrowLeft size={24} color={theme.tint} />
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: "600", color: theme.text }}>Settings</Text>
      {/* Add toggles, dropdowns here */}
    </View>
  );
}