// Debug screen to show what is in food storage

import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export default function DebugStorageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [debugData, setDebugData] = useState<any>({});

  const loadDebugData = async () => {
    try {
      const foodLog = await AsyncStorage.getItem("foodLog");
      const weeklyInsights = await AsyncStorage.getItem("weeklyInsightsData");
      const lastWeekStats = await AsyncStorage.getItem("lastWeekStats");
      const lastDailyLogClear = await AsyncStorage.getItem("lastDailyLogClear");
      const lastWeeklyReset = await AsyncStorage.getItem("lastWeeklyReset");

      const foodLogParsed = foodLog ? JSON.parse(foodLog) : [];
      const weeklyInsightsParsed = weeklyInsights ? JSON.parse(weeklyInsights) : [];

      setDebugData({
        foodLog: foodLogParsed,
        foodLogCount: foodLogParsed.length,
        foodLogEntries: foodLogParsed.map((e: any) => ({
          id: e.id,
          name: e.recipeName,
          timestamp: new Date(e.timestamp).toLocaleString(),
          mealType: e.mealType,
          nutrition: e.nutrition,
        })),
        weeklyInsights: weeklyInsightsParsed,
        weeklyInsightsCount: weeklyInsightsParsed.length,
        weeklyInsightsEntries: weeklyInsightsParsed.map((e: any) => ({
          id: e.id,
          name: e.recipeName,
          timestamp: new Date(e.timestamp).toLocaleString(),
          mealType: e.mealType,
          nutrition: e.nutrition,
        })),
        lastWeekStats: lastWeekStats ? JSON.parse(lastWeekStats) : null,
        lastDailyLogClear,
        lastWeeklyReset,
        currentDate: new Date().toLocaleString(),
        currentWeekStart: (() => {
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const day = now.getDay();
          const diff = now.getDate() - day;
          const weekStart = new Date(now.setDate(diff));
          weekStart.setHours(0, 0, 0, 0);
          return weekStart.toLocaleString();
        })(),
      });
    } catch (error) {
      console.error("Error loading debug data:", error);
    }
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "foodLog",
        "weeklyInsightsData",
        "lastWeekStats",
        "lastDailyLogClear",
        "lastWeeklyReset",
      ]);
      await loadDebugData();
      alert("All data cleared!");
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, padding: 20, paddingTop: 60 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={theme.tint} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", color: theme.text, flex: 1 }}>
          Storage Debug
        </Text>
        <TouchableOpacity onPress={loadDebugData}>
          <RefreshCw size={20} color={theme.tint} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={{ gap: 20 }}>
          {/* Current Info */}
          <View style={{ backgroundColor: theme.cardBackground, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Current Info
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Current Date: {debugData.currentDate}
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Week Start (Sunday): {debugData.currentWeekStart}
            </Text>
          </View>

          {/* Counts */}
          <View style={{ backgroundColor: theme.cardBackground, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Counts
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Food Log (Daily): {debugData.foodLogCount} entries
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Weekly Insights: {debugData.weeklyInsightsCount} entries
            </Text>
          </View>

          {/* Food Log Entries Detail */}
          {debugData.foodLogEntries && debugData.foodLogEntries.length > 0 && (
            <View style={{ backgroundColor: theme.cardBackground, padding: 16, borderRadius: 12 }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
                Food Log Entries
              </Text>
              {debugData.foodLogEntries.map((entry: any, index: number) => (
                <View key={index} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                  <Text style={{ color: theme.text, fontWeight: "600" }}>{entry.name}</Text>
                  <Text style={{ color: theme.icon, fontSize: 12 }}>Time: {entry.timestamp}</Text>
                  <Text style={{ color: theme.icon, fontSize: 12 }}>Meal: {entry.mealType}</Text>
                  <Text style={{ color: theme.icon, fontSize: 12 }}>
                    Nutrition: {entry.nutrition.calories}cal, {entry.nutrition.protein}g protein, {entry.nutrition.carbs}g carbs
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Dates */}
          <View style={{ backgroundColor: theme.cardBackground, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Last Resets
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Daily Clear: {debugData.lastDailyLogClear || "Never"}
            </Text>
            <Text style={{ color: theme.text, marginBottom: 4 }}>
              Weekly Reset: {debugData.lastWeeklyReset || "Never"}
            </Text>
          </View>

          {/* Raw JSON - Food Log */}
          <View style={{ backgroundColor: theme.cardBackground, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
              Food Log (Raw JSON)
            </Text>
            <ScrollView horizontal>
              <Text style={{ color: theme.icon, fontSize: 10, fontFamily: "monospace" }}>
                {JSON.stringify(debugData.foodLog, null, 2)}
              </Text>
            </ScrollView>
          </View>

          {/* Clear Button */}
          <TouchableOpacity
            onPress={clearAllData}
            style={{
              backgroundColor: "#EF4444",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>
              Clear All Storage Data
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}