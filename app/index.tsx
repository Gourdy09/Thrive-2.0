import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
<<<<<<< Updated upstream
  return <Redirect href="/(tabs)/dashboard" />;
=======
  const { user, loading, isFirstLaunch } = useAuth();

  AsyncStorage.clear();
  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // First time launch = show welcome screen
  if (isFirstLaunch) {
    return <Redirect href="./(auth)/welcome" />;
  }

  // Not logged in = show login screen
  if (!user) {
    return <Redirect href="./(auth)/login" />;
  }

  // Logged in = go to dashboard
  return <Redirect href="./(tabs)/dashboard" />;
>>>>>>> Stashed changes
}