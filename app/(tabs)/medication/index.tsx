import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { View, useColorScheme } from "react-native";
export default function Medication() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      <Header username="{UserName}" icon="Pill"/>
    </View>
  );
}
