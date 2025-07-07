import { Colors } from "@/constants/colors";

import { View, useColorScheme } from "react-native";
export default function Activity() {
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
    ></View>
  );
}
