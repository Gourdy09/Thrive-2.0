import DashboardHeader from "@/components/DashboardHeader";
import DashboardReport from "@/components/DashboardReport";
import { Colors } from "@/constants/Colors";

import { View, useColorScheme } from "react-native";

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const username = "{UserName}";
  const bloodGlucoseLevel = 0;
  const units = "mg/dL";
  const deltaSugar = -0;
  const expectedChange = 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      {/* Header */}
      <DashboardHeader username={username} />

      {/* Report Card */}
      <DashboardReport
        bloodGlucoseLevel={bloodGlucoseLevel}
        units={units}
        deltaSugar={deltaSugar}
        expectedChange={expectedChange}
      />
    </View>
  );
}
