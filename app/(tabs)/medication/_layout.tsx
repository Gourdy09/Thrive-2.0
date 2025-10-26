import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { useColorScheme, View } from "react-native";

export default function SubfolderLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />
    </View>
  );
}