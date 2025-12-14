<<<<<<< Updated upstream
import { Colors } from "@/constants/Colors";
=======
import { AuthProvider } from "@/contexts/AuthContext";
>>>>>>> Stashed changes
import { Stack } from "expo-router";
import { useColorScheme, View } from "react-native";

export default function RootLayout() {
<<<<<<< Updated upstream
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
          animation: "ios_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </View>
=======
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
>>>>>>> Stashed changes
  );
}