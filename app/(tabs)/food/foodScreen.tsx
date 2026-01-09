// app/(tabs)/food/foodScreen.tsx - UPDATED
import RecipeCard from "@/components/food/RecipeCard";
import { RecipeSkeletonGrid } from "@/components/food/RecipeCardSkeleton";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipeScraper } from "@/hooks/useRecipeScraper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Camera,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Popup from "./extendedRecipeInfoModal";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions?: string[];
  cookingTime?: string;
  prepTime?: string;
  totalTime?: string;
  servings?: string;
  nutrition?: {
    protein: number;
    carbs: number;
    fat?: number;
    calories?: number;
    fiber?: number;
  };
  tags?: string[];
  difficulty?: string;
  cuisine?: string;
  isBookmarked?: boolean;
}

interface FoodScreenProps {
  username?: string;
}

const { width } = Dimensions.get("window");

// Quick Action Card Component
function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.actionCard,
          {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.actionIcon, { backgroundColor: color + "20" }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.actionSubtitle, { color: theme.icon }]}>
            {subtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.icon} />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function FoodScreen({ username = "UserName" }: FoodScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [selectedRecipeID, setSelectedRecipeID] = useState<string>("");
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<string[]>([]);
  const [foodLogCount, setFoodLogCount] = useState(0);
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const [customRecipes, setCustomRecipes] = useState<RecipeData[]>([]);

  const { user } = useAuth();
  const username1 = user?.email?.split("@")[0] || "User";

  // Use the new recipe scraper hook
  const { recipes, loading, error, refreshRecipes, userPreferences } = useRecipeScraper();

  useEffect(() => {
    loadBookmarkedRecipes();
    loadFoodLogCount();
    loadCustomRecipes();

    // Initial recipe load
    refreshRecipes("healthy diabetic-friendly recipes");

    const interval = setInterval(loadFoodLogCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadBookmarkedRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem("bookmarkedRecipes");
      if (stored) setBookmarkedRecipes(JSON.parse(stored));
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const loadFoodLogCount = async () => {
    try {
      const stored = await AsyncStorage.getItem("foodLog");
      if (stored) {
        const parsed = JSON.parse(stored);
        const today = new Date().toDateString();
        const todayCount = parsed.filter((entry: any) => {
          const entryDate = new Date(entry.timestamp).toDateString();
          return entryDate === today;
        }).length;
        setFoodLogCount(todayCount);
      }
    } catch (error) {
      console.error("Error loading food log count:", error);
    }
  };

  const loadCustomRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem("customRecipes");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomRecipes(parsed);
      }
    } catch (error) {
      console.error("Error loading custom recipes:", error);
    }
  };

  const saveBookmarkedRecipes = async (bookmarks: string[]) => {
    try {
      await AsyncStorage.setItem(
        "bookmarkedRecipes",
        JSON.stringify(bookmarks)
      );
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  };

  const toggleBookmark = (recipeId: string) => {
    setBookmarkedRecipes((prev) => {
      const newBookmarks = prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId];
      saveBookmarkedRecipes(newBookmarks);
      return newBookmarks;
    });
  };

  const handleRecipePress = (recipeID: string) => {
    setSelectedRecipeID(recipeID);
    setIsPopUpVisible(true);
  };

  const handleCameraPress = () => router.push("./cameraScreen");
  const handleFoodLog = () => router.push("./foodLogScreen");
  const handleManualEntry = () => router.push("./manualEntryScreen");
  const handleInsights = () => router.push("./nutritionInsights");

  // Combine custom recipes with fetched recipes
  const allRecipes = [...customRecipes, ...recipes];

  const savedRecipes = allRecipes.filter((recipe) =>
    bookmarkedRecipes.includes(recipe.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Header username={username1} icon="Hamburger" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* AI Camera Scanner Card */}
        <TouchableOpacity
          style={[styles.scannerCard, { backgroundColor: theme.tint }]}
          onPress={handleCameraPress}
          activeOpacity={0.9}
        >
          <View style={styles.scannerContent}>
            <View
              style={[
                styles.scannerIcon,
                { backgroundColor: theme.background },
              ]}
            >
              <Camera size={28} color={theme.tint} />
            </View>
            <View style={styles.scannerText}>
              <Text
                style={[styles.scannerTitle, { color: theme.background }]}
              >
                AI Food Scanner
              </Text>
              <Text
                style={[styles.scannerSubtitle, { color: theme.background }]}
              >
                Instant nutrition analysis
              </Text>
            </View>
          </View>
          <Sparkles size={24} color={theme.background} />
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <QuickActionCard
              icon={BookOpen}
              title="Food Log"
              subtitle={`${foodLogCount} meals today`}
              color="#10B981"
              onPress={handleFoodLog}
            />
            <QuickActionCard
              icon={TrendingUp}
              title="Nutrition Insights"
              subtitle="View your trends"
              color="#3B82F6"
              onPress={handleInsights}
            />
          </View>
        </View>

        {/* Dietary Preferences Info */}
        {userPreferences && userPreferences.dietaryRestrictions.length > 0 && (
          <View
            style={{
              backgroundColor: theme.tint + "20",
              borderWidth: 1,
              borderColor: theme.tint + "40",
              borderRadius: 12,
              padding: 12,
              marginHorizontal: 10,
              marginBottom: 24,
            }}
          >
            <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}>
              Filtering for: {userPreferences.dietaryRestrictions.join(", ")}
            </Text>
          </View>
        )}

        {/* Custom Recipes Section */}
        {customRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Your Recipes
                </Text>
                <View
                  style={[styles.badge, { backgroundColor: "#10B981" + "30" }]}
                >
                  <Text style={[styles.badgeText, { color: "#10B981" }]}>
                    {customRecipes.length}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesScroll}
            >
              {customRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                  onPress={handleRecipePress}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Add Custom Recipe Button */}
        <TouchableOpacity
          style={[
            styles.addRecipeButton,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.tint,
            },
          ]}
          onPress={handleManualEntry}
        >
          <Text style={[styles.addRecipeText, { color: theme.tint }]}>
            + Create Custom Recipe
          </Text>
        </TouchableOpacity>

        {/* For You Section - Web Scraped Recipes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                For You
              </Text>
              <Zap size={20} color={theme.tint} />
            </View>
            <TouchableOpacity onPress={() => refreshRecipes()}>
              <RefreshCw size={20} color={theme.tint} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <RecipeSkeletonGrid />
          ) : error ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: theme.text }}>Error: {error}</Text>
              <TouchableOpacity
                onPress={() => refreshRecipes()}
                style={{
                  backgroundColor: theme.tint,
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                }}
              >
                <Text style={{ color: theme.background, fontWeight: "600" }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recipesScroll}
            >
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                  onPress={handleRecipePress}
                  onToggleBookmark={toggleBookmark}
                />

              ))}
            </ScrollView>
          )}
        </View>

        {/* Saved Recipes Section */}
        {savedRecipes.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => setShowSavedRecipes(!showSavedRecipes)}
              style={styles.sectionHeader}
            >
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Saved Recipes
                </Text>
                <View
                  style={[styles.badge, { backgroundColor: theme.tint + "30" }]}
                >
                  <Text style={[styles.badgeText, { color: theme.tint }]}>
                    {savedRecipes.length}
                  </Text>
                </View>
              </View>
              <ChevronRight
                size={20}
                color={theme.icon}
                style={{
                  transform: [{ rotate: showSavedRecipes ? "90deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>

            {showSavedRecipes && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recipesScroll}
              >
                {savedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                    onPress={handleRecipePress}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Recipe Modal */}
      <Popup
        visible={isPopUpVisible}
        onClose={() => setIsPopUpVisible(false)}
        title=" "
        recipeId={selectedRecipeID}
        allRecipes={allRecipes}
        isBookmarked={bookmarkedRecipes.includes(selectedRecipeID)}
        onToggleBookmark={toggleBookmark}
      >
        <Text> </Text>
      </Popup>
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
  scannerCard: {
    marginHorizontal: 10,
    marginBottom: 32,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scannerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  scannerText: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  scannerSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  actionsContainer: {
    paddingHorizontal: 10,
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  recipesScroll: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  loadingContainer: {
    width: 280,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  addRecipeButton: {
    marginHorizontal: 10,
    marginBottom: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
  },
  addRecipeText: {
    fontSize: 16,
    fontWeight: "700",
  },
});