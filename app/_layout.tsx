import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { runMigration } from "@/lib/migration";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
const dbReadyPromise = runMigration();

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    dbReadyPromise.then(() => setDbReady(true));
  }, []);
  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [user, loading]);

  return dbReady ? <Stack screenOptions={{ headerShown: false }} /> : null;
}
