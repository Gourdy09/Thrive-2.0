import {
  downloadExportFile,
  exportAllUsersData,
  exportSingleUserData,
} from "@/admin/adminExport";
import { useAuth } from "@/contexts/AuthContext";
import { Text, TouchableOpacity, View } from "react-native";
const OWNER_EMAILS = ["nishthahp08@gmail.com", "omp35336@gmail.com"];
export default function AdminScreen() {
  const { user } = useAuth();

  // Completely invisible to anyone else
  if (!OWNER_EMAILS.includes(user?.email ?? "")) return null;

  return (
    <View style={{ flex: 1, padding: 40, gap: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Admin Export</Text>

      <TouchableOpacity
        onPress={async () => {
          const json = await exportAllUsersData();
          await downloadExportFile(json);
        }}
        style={{ backgroundColor: "red", padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          Export All Users
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          const json = await exportSingleUserData(user!.id);
          await downloadExportFile(json);
        }}
        style={{ backgroundColor: "blue", padding: 16, borderRadius: 12 }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          Export My Data
        </Text>
      </TouchableOpacity>
    </View>
  );
}
