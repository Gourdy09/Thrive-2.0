import DashboardReport from "@/components/DashboardReport";
<<<<<<< Updated upstream
import GlucoseChart from "@/components/GlucoseChart";
import DashboardHeader from "@/components/Header";
=======
import Header from "@/components/Header";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      <DashboardHeader username={username} icon="LayoutDashboard"/>
=======
      <Header username={username} icon="LayoutDashboard"/>
>>>>>>> Stashed changes

      {/* Report Card */}
      <DashboardReport
        bloodGlucoseLevel={bloodGlucoseLevel}
        units={units}
        deltaSugar={deltaSugar}
        expectedChange={expectedChange}
      />
      <GlucoseChart/>
    </ScrollView>
  );
}
