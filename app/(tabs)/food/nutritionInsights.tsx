// app/(tabs)/food/nutritionInsights.tsx - UPDATED WITH AUTO-UPDATE & WEEKLY RESET
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  Activity,
  Apple,
  ArrowLeft,
  Calendar,
  Flame,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

interface NutritionStats {
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  totalMeals: number;
  weeklyData: {
    calories: number[];
    protein: number[];
    carbs: number[];
    labels: string[];
  };
  weekStartDate: string;
}

// Stat Card Component
function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  trendValue,
  color,
}: {
  icon: React.ComponentType<any>;
  title: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  color: string;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "#10B981" : "#EF4444";

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: theme.icon }]}>{title}</Text>
        <View style={styles.statValueRow}>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {value}
          </Text>
          <Text style={[styles.statUnit, { color: theme.icon }]}>{unit}</Text>
        </View>
        <View style={styles.statTrend}>
          <TrendIcon size={14} color={trendColor} />
          <Text style={[styles.statTrendText, { color: trendColor }]}>
            {trendValue}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function NutritionInsights() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";

  const [stats, setStats] = useState<NutritionStats>({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    totalMeals: 0,
    weeklyData: {
      calories: [],
      protein: [],
      carbs: [],
      labels: [],
    },
    weekStartDate: "",
  });

  const [lastWeekStats, setLastWeekStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    totalMeals: 0,
  });

  // Get start of current week (Sunday)
  const getWeekStart = (date: Date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  // Check if we need to reset weekly data
  const checkAndResetWeeklyData = async () => {
    try {
      const lastResetStr = await AsyncStorage.getItem("lastWeeklyReset");
      const currentWeekStart = getWeekStart();
      currentWeekStart.setHours(0, 0, 0, 0);

      if (lastResetStr) {
        const lastReset = new Date(lastResetStr);
        
        // If last reset was before current week start, we need to reset
        if (lastReset < currentWeekStart) {
          // Save current week's data as last week for comparison
          const currentStored = await AsyncStorage.getItem("weeklyInsightsData");
          if (currentStored) {
            const currentData = JSON.parse(currentStored);
            
            // Calculate last week's stats
            const lastWeekCalories = currentData.reduce((sum: number, entry: any) => 
              sum + (entry.nutrition.calories || 0), 0) / (currentData.length || 1);
            const lastWeekProtein = currentData.reduce((sum: number, entry: any) => 
              sum + (entry.nutrition.protein || 0), 0) / (currentData.length || 1);
            const lastWeekCarbs = currentData.reduce((sum: number, entry: any) => 
              sum + (entry.nutrition.carbs || 0), 0) / (currentData.length || 1);
            
            await AsyncStorage.setItem("lastWeekStats", JSON.stringify({
              avgCalories: Math.round(lastWeekCalories),
              avgProtein: Math.round(lastWeekProtein),
              avgCarbs: Math.round(lastWeekCarbs),
              totalMeals: currentData.length,
            }));
          }
          
          // Clear current week's insights data
          await AsyncStorage.setItem("weeklyInsightsData", JSON.stringify([]));
          await AsyncStorage.setItem("lastWeeklyReset", currentWeekStart.toISOString());
        }
      } else {
        // First time setup
        await AsyncStorage.setItem("lastWeeklyReset", currentWeekStart.toISOString());
      }
    } catch (error) {
      console.error("Error checking weekly reset:", error);
    }
  };

  // Load nutrition stats
  const loadNutritionStats = async () => {
    try {
      console.log("Loading nutrition stats...");
      
      // Check and reset weekly data if needed
      await checkAndResetWeeklyData();

      // Load BOTH daily food log AND weekly insights data
      const dailyStored = await AsyncStorage.getItem("foodLog");
      const weeklyStored = await AsyncStorage.getItem("weeklyInsightsData");
      
      const dailyLog = dailyStored ? JSON.parse(dailyStored) : [];
      const weeklyLog = weeklyStored ? JSON.parse(weeklyStored) : [];
      
      // Combine both - use a Set to avoid duplicates
      const allEntriesMap = new Map();
      [...weeklyLog, ...dailyLog].forEach((entry: any) => {
        allEntriesMap.set(entry.id, entry);
      });
      const foodLog = Array.from(allEntriesMap.values());
      
      console.log("Total entries loaded:", foodLog.length);

      // Load last week's stats for comparison
      const lastWeekStored = await AsyncStorage.getItem("lastWeekStats");
      if (lastWeekStored) {
        setLastWeekStats(JSON.parse(lastWeekStored));
      }

      const currentWeekStart = getWeekStart();
      console.log("Current week start:", currentWeekStart.toISOString());
      console.log("Current week start (local):", currentWeekStart.toString());
      
      // TEMPORARY: Don't filter by week, show ALL entries for debugging
      const weekEntries = foodLog; // Show all entries for now
      
      console.log("Week entries (ALL for debug):", weekEntries.length);
      if (weekEntries.length > 0) {
        console.log("First entry:", weekEntries[0]);
        console.log("Entry timestamp:", new Date(weekEntries[0].timestamp).toString());
      }

      // Calculate daily totals for the week (Sunday to Saturday)
      const dailyTotals: { [key: string]: { calories: number; protein: number; carbs: number; count: number } } = {};
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(date.getDate() + i);
        const dateKey = date.toDateString();
        dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, count: 0 };
      }

      weekEntries.forEach((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        const dateKey = entryDate.toDateString();
        console.log(`Processing entry for ${dateKey}:`, entry.nutrition);
        if (dailyTotals[dateKey]) {
          dailyTotals[dateKey].calories += entry.nutrition.calories || 0;
          dailyTotals[dateKey].protein += entry.nutrition.protein || 0;
          dailyTotals[dateKey].carbs += entry.nutrition.carbs || 0;
          dailyTotals[dateKey].count += 1;
        } else {
          console.log(`WARNING: Date ${dateKey} not found in dailyTotals`);
        }
      });
      
      console.log("Daily totals:", dailyTotals);

      // Create arrays for chart
      const labels: string[] = [];
      const calories: number[] = [];
      const protein: number[] = [];
      const carbs: number[] = [];

      Object.keys(dailyTotals).forEach((dateKey) => {
        const date = new Date(dateKey);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          date.getDay()
        ];
        labels.push(dayName);
        calories.push(Math.round(dailyTotals[dateKey].calories));
        protein.push(Math.round(dailyTotals[dateKey].protein));
        carbs.push(Math.round(dailyTotals[dateKey].carbs));
      });

      // Calculate averages (only for days with data)
      const daysWithData = Object.values(dailyTotals).filter(d => d.count > 0).length || 1;
      const totalCalories = calories.reduce((a, b) => a + b, 0);
      const totalProtein = protein.reduce((a, b) => a + b, 0);
      const totalCarbs = carbs.reduce((a, b) => a + b, 0);
      
      const avgCalories = Math.round(totalCalories / daysWithData);
      const avgProtein = Math.round(totalProtein / daysWithData);
      const avgCarbs = Math.round(totalCarbs / daysWithData);
      
      console.log("Averages - Calories:", avgCalories, "Protein:", avgProtein, "Carbs:", avgCarbs);
      console.log("Total meals:", weekEntries.length);

      setStats({
        avgCalories,
        avgProtein,
        avgCarbs,
        totalMeals: weekEntries.length,
        weeklyData: {
          calories,
          protein,
          carbs,
          labels,
        },
        weekStartDate: currentWeekStart.toLocaleDateString(),
      });
    } catch (error) {
      console.error("Error loading nutrition stats:", error);
    }
  };

  useEffect(() => {
    loadNutritionStats();
  }, []);

  // Reload stats when screen is focused (auto-update)
  useFocusEffect(
    useCallback(() => {
      loadNutritionStats();
    }, [])
  );

  // Calculate trends vs last week
  const calculateTrend = (current: number, last: number) => {
    if (last === 0) return { trend: "neutral" as const, value: "No data" };
    const percentChange = Math.round(((current - last) / last) * 100);
    const trend = percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral";
    return {
      trend: trend as "up" | "down" | "neutral",
      value: `${percentChange > 0 ? "+" : ""}${percentChange}% vs last week`,
    };
  };

  const caloriesTrend = calculateTrend(stats.avgCalories, lastWeekStats.avgCalories);
  const proteinTrend = calculateTrend(stats.avgProtein, lastWeekStats.avgProtein);
  const carbsTrend = calculateTrend(stats.avgCarbs, lastWeekStats.avgCarbs);
  const mealsTrend = calculateTrend(stats.totalMeals, lastWeekStats.totalMeals);

  const chartConfig = {
    backgroundColor: theme.background,
    backgroundGradientFrom: theme.cardBackground,
    backgroundGradientTo: theme.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(247, 179, 12, ${opacity})`,
    labelColor: () => theme.icon,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.tint,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header username={username} icon="Hamburger" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.tint} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Nutrition Insights
          </Text>
          <TouchableOpacity onPress={loadNutritionStats} style={styles.backButton}>
            <RefreshCw size={20} color={theme.tint} />
          </TouchableOpacity>
        </View>

        {/* Time Period */}
        <View style={styles.periodContainer}>
          <Calendar size={16} color={theme.icon} />
          <Text style={[styles.periodText, { color: theme.icon }]}>
            Week of {stats.weekStartDate} • Resets Sunday
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={Flame}
            title="Avg Calories"
            value={stats.avgCalories}
            unit="kcal"
            trend={caloriesTrend.trend}
            trendValue={caloriesTrend.value}
            color="#EF4444"
          />
          <StatCard
            icon={Zap}
            title="Avg Protein"
            value={stats.avgProtein}
            unit="g"
            trend={proteinTrend.trend}
            trendValue={proteinTrend.value}
            color="#10B981"
          />
          <StatCard
            icon={Apple}
            title="Avg Carbs"
            value={stats.avgCarbs}
            unit="g"
            trend={carbsTrend.trend}
            trendValue={carbsTrend.value}
            color="#3B82F6"
          />
          <StatCard
            icon={Activity}
            title="Total Meals"
            value={stats.totalMeals}
            unit="meals"
            trend={mealsTrend.trend}
            trendValue={mealsTrend.value}
            color="#F59E0B"
          />
        </View>

        {/* Calories Chart */}
        {stats.totalMeals > 0 && stats.weeklyData.calories.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Daily Calories
            </Text>
            <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <LineChart
                data={{
                  labels: stats.weeklyData.labels,
                  datasets: [
                    {
                      data: stats.weeklyData.calories.length > 0 
                        ? stats.weeklyData.calories.map(v => Math.max(v, 0))
                        : [0],
                    },
                  ],
                }}
                width={width - 68}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                fromZero
              />
            </View>
          </View>
        )}

        {/* Protein Chart */}
        {stats.totalMeals > 0 && stats.weeklyData.protein.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Daily Protein Intake
            </Text>
            <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <LineChart
                data={{
                  labels: stats.weeklyData.labels,
                  datasets: [
                    {
                      data: stats.weeklyData.protein.length > 0
                        ? stats.weeklyData.protein.map(v => Math.max(v, 0))
                        : [0],
                    },
                  ],
                }}
                width={width - 68}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                }}
                bezier
                style={styles.chart}
                fromZero
              />
            </View>
          </View>
        )}

        {/* Carbs Chart */}
        {stats.totalMeals > 0 && stats.weeklyData.carbs.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Daily Carbohydrate Intake
            </Text>
            <View
              style={[
                styles.chartContainer,
                { backgroundColor: theme.cardBackground },
              ]}
            >
              <LineChart
                data={{
                  labels: stats.weeklyData.labels,
                  datasets: [
                    {
                      data: stats.weeklyData.carbs.length > 0
                        ? stats.weeklyData.carbs.map(v => Math.max(v, 0))
                        : [0],
                    },
                  ],
                }}
                width={width - 68}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                }}
                bezier
                style={styles.chart}
                fromZero
              />
            </View>
          </View>
        )}

        {stats.totalMeals === 0 && (
          <View style={styles.emptyState}>
            <Activity size={48} color={theme.icon} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Data Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.icon }]}>
              Start logging meals to see your nutrition insights
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  statCard: {
    width: (width - 68) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statContent: {
    gap: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  statUnit: {
    fontSize: 14,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statTrendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartSection: {
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  chart: {
    borderRadius: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});