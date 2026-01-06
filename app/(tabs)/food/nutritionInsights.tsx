import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Activity,
  Apple,
  ArrowLeft,
  Calendar,
  Flame,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
  });

  useEffect(() => {
    loadNutritionStats();
  }, []);

  const loadNutritionStats = async () => {
    try {
      const stored = await AsyncStorage.getItem("foodLog");
      if (!stored) {
        // Set default empty stats
        return;
      }

      const foodLog = JSON.parse(stored);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Filter last 7 days
      const recentEntries = foodLog.filter((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= sevenDaysAgo;
      });

      // Calculate daily totals for the week
      const dailyTotals: { [key: string]: { calories: number; protein: number; carbs: number; count: number } } = {};
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();
        dailyTotals[dateKey] = { calories: 0, protein: 0, carbs: 0, count: 0 };
      }

      recentEntries.forEach((entry: any) => {
        const dateKey = new Date(entry.timestamp).toDateString();
        if (dailyTotals[dateKey]) {
          dailyTotals[dateKey].calories += entry.nutrition.calories || 0;
          dailyTotals[dateKey].protein += entry.nutrition.protein || 0;
          dailyTotals[dateKey].carbs += entry.nutrition.carbs || 0;
          dailyTotals[dateKey].count += 1;
        }
      });

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

      // Calculate averages
      const totalDays = Object.values(dailyTotals).filter(d => d.count > 0).length;
      const avgCalories = Math.round(
        calories.reduce((a, b) => a + b, 0) / (totalDays || 1)
      );
      const avgProtein = Math.round(
        protein.reduce((a, b) => a + b, 0) / (totalDays || 1)
      );
      const avgCarbs = Math.round(
        carbs.reduce((a, b) => a + b, 0) / (totalDays || 1)
      );

      setStats({
        avgCalories,
        avgProtein,
        avgCarbs,
        totalMeals: recentEntries.length,
        weeklyData: {
          calories,
          protein,
          carbs,
          labels,
        },
      });
    } catch (error) {
      console.error("Error loading nutrition stats:", error);
    }
  };

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
          <View style={{ width: 24 }} />
        </View>

        {/* Time Period */}
        <View style={styles.periodContainer}>
          <Calendar size={16} color={theme.icon} />
          <Text style={[styles.periodText, { color: theme.icon }]}>
            Last 7 Days
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={Flame}
            title="Avg Calories"
            value={stats.avgCalories}
            unit="kcal"
            trend="up"
            trendValue="+5% vs last week"
            color="#EF4444"
          />
          <StatCard
            icon={Zap}
            title="Avg Protein"
            value={stats.avgProtein}
            unit="g"
            trend="up"
            trendValue="+8% vs last week"
            color="#10B981"
          />
          <StatCard
            icon={Apple}
            title="Avg Carbs"
            value={stats.avgCarbs}
            unit="g"
            trend="down"
            trendValue="-3% vs last week"
            color="#3B82F6"
          />
          <StatCard
            icon={Activity}
            title="Total Meals"
            value={stats.totalMeals}
            unit="meals"
            trend="up"
            trendValue="+2 vs last week"
            color="#F59E0B"
          />
        </View>

        {/* Calories Chart */}
        {stats.weeklyData.calories.length > 0 && (
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
                      data: stats.weeklyData.calories,
                    },
                  ],
                }}
                width={width - 68}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>
          </View>
        )}

        {/* Protein Chart */}
        {stats.weeklyData.protein.length > 0 && (
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
                      data: stats.weeklyData.protein,
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
              />
            </View>
          </View>
        )}

        {/* Carbs Chart */}
        {stats.weeklyData.carbs.length > 0 && (
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
                      data: stats.weeklyData.carbs,
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