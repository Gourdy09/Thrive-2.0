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

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    async function init() {
      await runMigration();
      setDbReady(true);
    }
    init();
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

  return <Stack screenOptions={{ headerShown: false }} />;
}
