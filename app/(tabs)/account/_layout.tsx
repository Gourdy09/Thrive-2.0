import { Colors } from "@/constants/colors";
import { Stack } from "expo-router";
import { useColorScheme, View } from "react-native";

export default function AccountLayout() {
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
          animation: "ios_from_right",
          contentStyle: {
            backgroundColor: theme.background,
          },
          presentation: "transparentModal",
        }}
      />
    </View>
  );
}
