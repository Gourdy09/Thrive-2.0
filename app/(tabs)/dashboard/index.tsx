import DashboardReport from "@/components/dashboard/DashboardReport";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";

import { ScrollView, useColorScheme } from "react-native";

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const username = "{UserName}";
  const bloodGlucoseLevel = 0;
  const units = "mg/dL";
  const deltaSugar = -0;
  const expectedChange = 0;

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      {/* Header */}
      <Header username={username} icon="LayoutDashboard" />

      {/* Report Card */}
      <DashboardReport
        bloodGlucoseLevel={bloodGlucoseLevel}
        units={units}
        deltaSugar={deltaSugar}
        expectedChange={expectedChange}
      />
      <GlucoseChart />
    </ScrollView>
  );
}
