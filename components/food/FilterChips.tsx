import { Colors } from "@/constants/Colors";
import { Check, X } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export interface RecipeFilters {
  cuisines: string[];
  maxCookTime?: number;
  difficulty?: string;
  mealType?: string;
}

interface FilterChipsProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  onClear: () => void;
}

const CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Indian",
  "Thai",
  "Mediterranean",
  "American",
  "French",
  "Greek",
  "Korean",
  "Vietnamese",
];

const COOK_TIMES = [
  { label: "Under 15 min", value: 15 },
  { label: "Under 30 min", value: 30 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 60 min", value: 60 },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

export default function FilterChips({
  filters,
  onFiltersChange,
  onClear,
}: FilterChipsProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const toggleCuisine = (cuisine: string) => {
    const newCuisines = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter((c) => c !== cuisine)
      : [...filters.cuisines, cuisine];
    onFiltersChange({ ...filters, cuisines: newCuisines });
  };

  const setCookTime = (time: number) => {
    onFiltersChange({
      ...filters,
      maxCookTime: filters.maxCookTime === time ? undefined : time,
    });
  };

  const setDifficulty = (difficulty: string) => {
    onFiltersChange({
      ...filters,
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
    });
  };

  const setMealType = (mealType: string) => {
    onFiltersChange({
      ...filters,
      mealType: filters.mealType === mealType ? undefined : mealType,
    });
  };

  const hasActiveFilters =
    filters.cuisines.length > 0 ||
    filters.maxCookTime !== undefined ||
    filters.difficulty !== undefined ||
    filters.mealType !== undefined;

  return (
    <View style={{ marginBottom: 24 }}>
      {/* Header with Clear Button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingHorizontal: 10,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          Filters
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity
            onPress={onClear}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: theme.tint + "20",
            }}
          >
            <X size={14} color={theme.tint} />
            <Text
              style={{
                color: theme.tint,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Meal Type */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 8,
            paddingHorizontal: 10,
          }}
        >
          Meal Type
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
        >
          {MEAL_TYPES.map((type) => (
            <FilterChip
              key={type}
              label={type}
              selected={filters.mealType === type}
              onPress={() => setMealType(type)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Cook Time */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 8,
            paddingHorizontal: 10,
          }}
        >
          Cook Time
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
        >
          {COOK_TIMES.map((time) => (
            <FilterChip
              key={time.value}
              label={time.label}
              selected={filters.maxCookTime === time.value}
              onPress={() => setCookTime(time.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Difficulty */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 8,
            paddingHorizontal: 10,
          }}
        >
          Difficulty
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
        >
          {DIFFICULTIES.map((diff) => (
            <FilterChip
              key={diff}
              label={diff}
              selected={filters.difficulty === diff}
              onPress={() => setDifficulty(diff)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Cuisines */}
      <View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "600",
            color: theme.icon,
            marginBottom: 8,
            paddingHorizontal: 10,
          }}
        >
          Cuisine
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
        >
          {CUISINES.map((cuisine) => (
            <FilterChip
              key={cuisine}
              label={cuisine}
              selected={filters.cuisines.includes(cuisine)}
              onPress={() => toggleCuisine(cuisine)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: selected ? theme.tint : theme.border,
        backgroundColor: selected
          ? theme.tint + "20"
          : colorScheme === "dark"
          ? "#1c1e22"
          : "#f8f9fa",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      {selected && <Check size={14} color={theme.tint} />}
      <Text
        style={{
          color: selected ? theme.tint : theme.text,
          fontSize: 14,
          fontWeight: selected ? "600" : "500",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}