import DashboardReport from "@/components/dashboard/DashboardReport";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, useColorScheme, View } from "react-native";

export default function Dashboard() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const username = "{UserName}";
  const bloodGlucoseLevel = 0;
  const units = "mg/dL";
  const deltaSugar = -0;
  const expectedChange = 0;

  interface GlucoseReading {
    value: number;
    timestamp: Date;
  }
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${hour}${suffix}`;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("SugarData");
        if (jsonValue != null) {
          const parsed: GlucoseReading[] = JSON.parse(jsonValue).map(
            (d: any) => ({
              timestamp: new Date(d.timestamp),
              value: d.value,
            })
          );
          setGlucoseData(parsed);
        } else {
          const now = new Date();
          const mock: GlucoseReading[] = Array.from({ length: 8 }, (_, i) => ({
            timestamp: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              i
            ),
            value: 90 + Math.floor(Math.random() * 40),
          }));
          setGlucoseData(mock);
        }
      } catch (e) {
        console.error("loading Errror:", e);
        console.log(e);
      }
    };
    loadData();
  }, []);

  const chartWidth = Math.max(Dimensions.get("window").width * 4, 800);
  const centerScroll = () => {
    if (scrollViewRef.current) {
      const currentHour = new Date().getHours();
      const screenWidth = Dimensions.get("window").width;
      const hourWidth = chartWidth / 24;
      const scrollX = currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollX),
          animated: true,
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (glucoseData.length > 0) {
      centerScroll();
    }
  }, [glucoseData, chartWidth]);

  useEffect(() => {
    if (isFocused) {
      centerScroll();
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        const currentHour = new Date().getHours();
        const screenWidth = Dimensions.get("window").width;
        const hourWidth = chartWidth / 24;
        const scrollX =
          currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: Math.max(0, scrollX),
            animated: false,
          });
        }, 100);
      }
    }, [chartWidth])
  );

  const hourlyValues = Array(24).fill(null);
  glucoseData.forEach((d) => {
    const hour = d.timestamp.getHours();
    hourlyValues[hour] = d.value;
  });
  let lastValue = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyValues[i] == null) hourlyValues[i] = lastValue;
    else lastValue = hourlyValues[i];
  }
  const chartData = {
    labels: hourLabels,
    datasets: [
      {
        data: hourlyValues,
      },
    ],
  };

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
      <Header username={username} icon="LayoutDashboard" />

      {/* Report Card */}

      <DashboardReport
        bloodGlucoseLevel={bloodGlucoseLevel}
        units={units}
        deltaSugar={deltaSugar}
        expectedChange={expectedChange}
      />
      <ScrollView>
        <GlucoseChart />
      </ScrollView>
    </View>
  );
}
