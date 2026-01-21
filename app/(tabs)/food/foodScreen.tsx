// app/(tabs)/food/foodScreen.tsx - FIXED INFINITE SCROLL

import FilterChips, { RecipeFilters } from "@/components/food/FilterChips";
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
  Zap
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  
  // Infinite scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastScrollX = useRef(0);
  const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [filters, setFilters] = useState<RecipeFilters>({
    cuisines: [],
    maxCookTime: undefined,
    difficulty: undefined,
    mealType: undefined,
  });

  const { user } = useAuth();
  const username1 = user?.email?.split("@")[0] || "User";

  const { recipes, loading, error, refreshRecipes, userPreferences, cycleRecipes } = useRecipeScraper();

  useEffect(() => {
    loadBookmarkedRecipes();
    loadFoodLogCount();
    loadCustomRecipes();

    const interval = setInterval(loadFoodLogCount, 3000);
    return () => {
      clearInterval(interval);
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
      }
    };
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

  const handleCameraPress = () => router.push("/(tabs)/food/cameraScreen");
  const handleFoodLog = () => router.push("/(tabs)/food/foodLogScreen");
  const handleManualEntry = () => router.push("/(tabs)/food/manualEntryScreen");
  const handleInsights = () => router.push("/(tabs)/food/nutritionInsights");

  const handleFiltersChange = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
    refreshRecipes("healthy recipes", newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      cuisines: [],
      maxCookTime: undefined,
      difficulty: undefined,
      mealType: undefined,
    };
    setFilters(emptyFilters);
    refreshRecipes("healthy recipes", emptyFilters);
  };

  // Improved load more with debouncing
  const loadMoreRecipes = useCallback(() => {
    // Clear any existing timeout
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
    }

    // Don't load if already loading
    if (isLoadingMore || loading) {
      return;
    }

    // Debounce the load more call
    loadMoreTimeoutRef.current = setTimeout(async () => {
      setIsLoadingMore(true);
      try {
        await cycleRecipes();
      } catch (error) {
        console.error("Error loading more recipes:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }, 500); // 500ms debounce
  }, [cycleRecipes, isLoadingMore, loading]);

  // Track scroll position and trigger load more
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const currentScrollX = contentOffset.x;
      const scrollWidth = contentSize.width;
      const viewWidth = layoutMeasurement.width;

      // Only trigger if scrolling forward (to the right)
      const isScrollingForward = currentScrollX > lastScrollX.current;
      lastScrollX.current = currentScrollX;

      // Calculate distance from end
      const distanceFromEnd = scrollWidth - (currentScrollX + viewWidth);
      
      // Only load more if:
      // 1. Scrolling forward
      // 2. Within 300px of end
      // 3. Not already loading
      const LOAD_MORE_THRESHOLD = 300;
      
      if (
        isScrollingForward && 
        distanceFromEnd < LOAD_MORE_THRESHOLD && 
        !isLoadingMore && 
        !loading
      ) {
        loadMoreRecipes();
      }
    },
    [loadMoreRecipes, isLoadingMore, loading]
  );

  // Handle scroll end to ensure we don't get stuck
  const handleScrollEndDrag = useCallback(() => {
    // Clear the timeout when user stops dragging
    if (loadMoreTimeoutRef.current) {
      clearTimeout(loadMoreTimeoutRef.current);
      loadMoreTimeoutRef.current = null;
    }
  }, []);

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

        {/* Filter Chips */}
        <FilterChips
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClear={handleClearFilters}
        />

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

        {/* For You Section - Infinite Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                For You
              </Text>
              <Zap size={20} color={theme.tint} />
            </View>
            <TouchableOpacity 
              onPress={() => refreshRecipes("healthy recipes", filters)}
              disabled={loading}
            >
              <RefreshCw 
                size={20} 
                color={loading ? theme.icon : theme.tint}
              />
            </TouchableOpacity>
          </View>

          {loading && recipes.length === 0 ? (
            <RecipeSkeletonGrid />
          ) : error && !error.includes("quota") ? (
            <View style={styles.loadingContainer}>
              <Text style={{ color: theme.text, textAlign: 'center', marginBottom: 8 }}>
                Error: {error}
              </Text>
              <TouchableOpacity
                onPress={() => refreshRecipes("healthy recipes", filters)}
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
            <View>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recipesScroll}
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEndDrag}
                scrollEventThrottle={400}
              >
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={`${recipe.id}-${index}`}
                    recipe={recipe}
                    isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                    onPress={handleRecipePress}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
                
                {/* Loading indicator at the end */}
                {isLoadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingMoreText, { color: theme.icon }]}>
                      Loading more...
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
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
    paddingHorizontal: 20,
  },
  loadingMoreContainer: {
    width: 150,
    height: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingMoreText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
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