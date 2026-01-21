import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useFoodLogCleanup } from "@/hooks/useFoodLogCleanup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Coffee,
  Moon,
  Pizza,
  Sunrise,
  Sunset,
  Trash2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface FoodLogEntry {
  id: string;
  recipeId?: string;
  recipeName: string;
  timestamp: Date;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  nutrition: {
    protein: number;
    carbs: number;
    calories?: number;
    fiber: number;
  };
  imageUrl?: string;
}

export default function FoodLogScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [selectedDate] = useState(new Date());

  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";
  
  // Use the cleanup hook
  useFoodLogCleanup();

  const loadFoodLog = async () => {
    try {
      const stored = await AsyncStorage.getItem("foodLog");
      if (stored) {
        const parsed = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        
        // Filter for today's entries only
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEntries = parsed.filter((entry: FoodLogEntry) => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === today.getTime();
        });
        
        setFoodLog(todayEntries);
      }
    } catch (error) {
      console.error("Error loading food log:", error);
    }
  };

  useEffect(() => {
    loadFoodLog();
  }, [selectedDate]);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFoodLog();
    }, [])
  );

  const saveFoodLog = async (log: FoodLogEntry[]) => {
    try {
      await AsyncStorage.setItem("foodLog", JSON.stringify(log));
    } catch (error) {
      console.error("Error saving food log:", error);
    }
  };

  const deleteEntry = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to remove this from your food log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const newLog = foodLog.filter((entry) => entry.id !== id);
            setFoodLog(newLog);
            await saveFoodLog(newLog);
          },
        },
      ]
    );
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return Sunrise;
      case "lunch":
        return Sunset;
      case "dinner":
        return Moon;
      case "snack":
        return Coffee;
      default:
        return Pizza;
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "#FF6B6B";
      case "lunch":
        return "#4ECDC4";
      case "dinner":
        return "#95E1D3";
      case "snack":
        return "#FFA07A";
      default:
        return theme.icon;
    }
  };

  const groupByMealType = () => {
    const grouped: { [key: string]: FoodLogEntry[] } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    foodLog.forEach((entry) => {
      grouped[entry.mealType].push(entry);
    });

    return grouped;
  };

  const getTotalNutrition = () => {
    return foodLog.reduce(
      (acc, entry) => ({
        protein: acc.protein + (entry.nutrition.protein || 0),
        carbs: acc.carbs + (entry.nutrition.carbs || 0),
        calories: acc.calories + (entry.nutrition.calories || 0),
        fiber: acc.fiber + (entry.nutrition.fiber || 0)
      }),
      { protein: 0, carbs: 0, calories: 0, fiber: 0 }
    );
  };

  const groupedEntries = groupByMealType();
  const totalNutrition = getTotalNutrition();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      <Header username={username} icon="Hamburger" />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginLeft: -8,
            marginRight: 8,
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          Food Log
        </Text>
      </View>

      {/* Daily Summary */}
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          borderWidth: 2,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Calendar size={20} color={theme.icon} />
          <Text
            style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            Today's Nutrition • Resets Daily
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: theme.icon, fontSize: 12, marginBottom: 4 }}>
              Protein
            </Text>
            <Text
              style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}
            >
              {Math.round(totalNutrition.protein)}g
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: theme.icon, fontSize: 12, marginBottom: 4 }}>
              Carbs
            </Text>
            <Text
              style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}
            >
              {Math.round(totalNutrition.carbs)}g
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: theme.icon, fontSize: 12, marginBottom: 4 }}>
              Calories
            </Text>
            <Text
              style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}
            >
              {Math.round(totalNutrition.calories || 0)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: theme.icon, fontSize: 12, marginBottom: 4 }}>
              Fiber
            </Text>
            <Text
              style={{ color: theme.text, fontSize: 24, fontWeight: "700" }}
            >
              {Math.round(totalNutrition.fiber || 0)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {(["breakfast", "lunch", "dinner", "snack"] as const).map(
          (mealType) => {
            const entries = groupedEntries[mealType];
            if (entries.length === 0) return null;

            const MealIcon = getMealIcon(mealType);
            const mealColor = getMealColor(mealType);

            return (
              <View key={mealType} style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <MealIcon size={20} color={mealColor} />
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: theme.text,
                      marginLeft: 8,
                      textTransform: "capitalize",
                    }}
                  >
                    {mealType}
                  </Text>
                </View>

                {entries.map((entry) => (
                  <View
                    key={entry.id}
                    style={{
                      backgroundColor: theme.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderLeftWidth: 4,
                      borderLeftColor: mealColor,
                      borderWidth: 2,
                      borderColor: theme.border,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: theme.text,
                            marginBottom: 4,
                          }}
                        >
                          {entry.recipeName}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Clock size={12} color={theme.icon} />
                          <Text
                            style={{
                              fontSize: 12,
                              color: theme.icon,
                              marginLeft: 4,
                            }}
                          >
                            {entry.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                          <Text style={{ fontSize: 12, color: theme.icon }}>
                            Protein: {Math.round(entry.nutrition.protein)}g
                          </Text>
                          <Text style={{ fontSize: 12, color: theme.icon }}>
                            Carbs: {Math.round(entry.nutrition.carbs)}g
                          </Text>
                          <Text style={{ fontSize: 12, color: theme.icon }}>
                            Fiber: {Math.round(entry.nutrition.fiber)}g
                          </Text>
                        </View>
                      </View>

                      {entry.imageUrl && (
                        <Image
                          source={{ uri: entry.imageUrl }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                            marginLeft: 12,
                          }}
                        />
                      )}

                      <TouchableOpacity
                        onPress={() => deleteEntry(entry.id)}
                        style={{
                          padding: 8,
                          marginLeft: 8,
                        }}
                      >
                        <Trash2 size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          }
        )}

        {foodLog.length === 0 && (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 16,
              padding: 40,
              alignItems: "center",
              borderWidth: 2,
              borderColor: theme.border,
            }}
          >
            <Pizza size={48} color={theme.icon} style={{ marginBottom: 16 }} />
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                textAlign: "center",
              }}
            >
              No food logged yet today.{"\n"}Start tracking your meals!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}