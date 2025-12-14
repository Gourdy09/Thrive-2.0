// app/(tabs)/food/foodScreen.tsx
import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BookOpen, Camera, ChevronRight, TableOfContents } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import Popup from "./extendedRecipeInfoModal";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  cT: string;
  protein: number;
  carbs: number;
  tags: string[];
  servingSize: string;
  isBookmarked: boolean;
}

interface FoodScreenProps {
  username?: string;
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  icon: Icon,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? theme.cardSelected : theme.cardBackground,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      {Icon && (
        <View style={{ marginBottom: 8 }}>
          <Icon size={60} color={theme.icon} />
        </View>
      )}
      <Text style={{ color: theme.text }}>{title}</Text>
    </Pressable>
  );
};

export default function FoodScreen({ username = "User" }: FoodScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [selectedRecipeID, setSelectedRecipeID] = useState<string>("");
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<string[]>([]);
  const [customRecipes, setCustomRecipes] = useState<RecipeData[]>([]);
  const [foodLogCount, setFoodLogCount] = useState(0);
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const [showCustomRecipes, setShowCustomRecipes] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const { recipeData, loading, error } = useMockWebscrape();
  
  const suggestionsScrollRef = useRef<ScrollView>(null);
  const savedScrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = 280 + 16;

  // Load data on mount
  useEffect(() => {
    loadBookmarkedRecipes();
    loadCustomRecipes();
    loadFoodLogCount();
    
    const interval = setInterval(loadFoodLogCount, 3000);
    return () => clearInterval(interval);
  }, []);

  // Reload custom recipes when screen comes into focus (after adding/editing)
  useFocusEffect(
    React.useCallback(() => {
      loadCustomRecipes();
      loadFoodLogCount();
    }, [])
  );

  const loadBookmarkedRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarkedRecipes');
      if (stored) setBookmarkedRecipes(JSON.parse(stored));
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  const loadCustomRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem('customRecipes');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomRecipes(parsed);
      }
    } catch (error) {
      console.error("Error loading custom recipes:", error);
    }
  };

  const saveCustomRecipes = async (recipes: RecipeData[]) => {
    try {
      await AsyncStorage.setItem('customRecipes', JSON.stringify(recipes));
    } catch (error) {
      console.error("Error saving custom recipes:", error);
    }
  };

  const loadFoodLogCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('foodLog');
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

  const saveBookmarkedRecipes = async (bookmarks: string[]) => {
    try {
      await AsyncStorage.setItem('bookmarkedRecipes', JSON.stringify(bookmarks));
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

  const addCustomRecipe = (recipe: RecipeData) => {
    const newRecipes = [...customRecipes, recipe];
    setCustomRecipes(newRecipes);
    saveCustomRecipes(newRecipes);
  };

  const handleRecipePress = (recipeID: string) => {
    setSelectedRecipeID(recipeID);
    setIsPopUpVisible(true);
  };

  const handleSeeAll = () => router.push("/(tabs)/food/allRecipesScreen");
  const handleManualEntry = () => router.push("/(tabs)/food/manualEntryScreen");
  const handleCameraEntry = () => router.push("/(tabs)/food/cameraScreen");
  const handleFoodLog = () => {
    try {
      router.push("/(tabs)/food/foodLogScreen");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Coming Soon", "Food log feature will be available soon!");
    }
  };

  const addCustomRecipeToLog = async (recipe: RecipeData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      const logEntry = {
        id: Date.now().toString(),
        recipeId: recipe.id,
        recipeName: recipe.title,
        timestamp: new Date().toISOString(),
        mealType,
        nutrition: {
          protein: recipe.protein || 0,
          carbs: recipe.carbs || 0,
          calories: (recipe.protein || 0) * 4 + (recipe.carbs || 0) * 4,
        },
        imageUrl: recipe.imageUrl || undefined,
      };

      const stored = await AsyncStorage.getItem('foodLog');
      const currentLog = stored ? JSON.parse(stored) : [];
      const updatedLog = [logEntry, ...currentLog];
      
      await AsyncStorage.setItem('foodLog', JSON.stringify(updatedLog));
      setFoodLogCount(updatedLog.filter((entry: any) => {
        const entryDate = new Date(entry.timestamp).toDateString();
        return entryDate === new Date().toDateString();
      }).length);
      
      Alert.alert(
        "Added to Food Log",
        `${recipe.title} has been logged for ${mealType}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding to food log:", error);
      Alert.alert("Error", "Failed to add to food log");
    }
  };

  const handleDeleteCustomRecipe = async (recipeId: string) => {
    setRecipeToDelete(recipeId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    
    try {
      const updatedRecipes = customRecipes.filter(r => r.id !== recipeToDelete);
      setCustomRecipes(updatedRecipes);
      await saveCustomRecipes(updatedRecipes);
      setDeleteModalVisible(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleEditCustomRecipe = (recipe: RecipeData) => {
    router.push({
      pathname: "/(tabs)/food/editRecipeScreen",
      params: { recipeData: JSON.stringify(recipe) },
    });
  };

  const handleScrollEnd = (
    event: any,
    scrollRef: React.RefObject<ScrollView | null>
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / cardWidth);
    scrollRef.current?.scrollTo({ x: index * cardWidth, animated: true });
  };

  const savedRecipes = recipeData.filter((recipe) =>
    bookmarkedRecipes.includes(recipe.id)
  );

  // Combine all recipes for the popup
  const allRecipes = [...recipeData, ...customRecipes];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      {/* Fixed Header */}
      <View
        style={{
          paddingHorizontal: 14,
          paddingTop: 60,
          backgroundColor: theme.background,
        }}
      >
        <Header username={username} icon="Hamburger" />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16 }}>
          {/* Suggestions Section */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 25, fontWeight: "bold", color: theme.text }}
            >
              Suggestions
            </Text>
            <TouchableOpacity
              onPress={handleSeeAll}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ color: theme.icon, marginRight: 4 }}>See all</Text>
              <ChevronRight size={16} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Suggestions Carousel with Fade */}
          <View style={{ position: 'relative' }}>
            <ScrollView
              ref={suggestionsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={cardWidth}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => handleScrollEnd(e, suggestionsScrollRef)}
              contentContainerStyle={{ paddingRight: 80 }}
            >
              {loading && (
                <View
                  style={{
                    width: 280,
                    marginRight: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <Text style={{ color: theme.text }}>Loading...</Text>
                </View>
              )}
              {error && (
                <View
                  style={{
                    width: 280,
                    marginRight: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <Text style={{ color: theme.text }}>Error: {error}</Text>
                </View>
              )}
              {!loading &&
                !error &&
                recipeData.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    {...recipe}
                    isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                    onPress={handleRecipePress}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
            </ScrollView>
          </View>

          {/* Saved Recipes Section */}
          {(savedRecipes.length > 0 || customRecipes.length > 0) && (
            <>
              <TouchableOpacity
                onPress={() => setShowSavedRecipes(!showSavedRecipes)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 24,
                  marginBottom: 16,
                  paddingVertical: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text
                    style={{ fontSize: 20, fontWeight: "600", color: theme.text }}
                  >
                    Saved Recipes
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.tint + "30",
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: theme.tint,
                      }}
                    >
                      {savedRecipes.length}
                    </Text>
                  </View>
                </View>
                <ChevronRight 
                  size={20} 
                  color={theme.icon}
                  style={{
                    transform: [{ rotate: showSavedRecipes ? '90deg' : '0deg' }]
                  }}
                />
              </TouchableOpacity>

              {showSavedRecipes && (
                <ScrollView
                  ref={savedScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardWidth}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScrollEnd(e, savedScrollRef)}
                  contentContainerStyle={{ paddingRight: 80 }}
                  style={{ marginBottom: 16 }}
                >
                  {savedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      {...recipe}
                      isBookmarked={bookmarkedRecipes.includes(recipe.id)}
                      onPress={handleRecipePress}
                      onToggleBookmark={toggleBookmark}
                    />
                  ))}
                </ScrollView>
              )}
            </>
          )}

          {/* Custom Recipes Section */}
          {customRecipes.length > 0 && (
            <>
              <TouchableOpacity
                onPress={() => setShowCustomRecipes(!showCustomRecipes)}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: showSavedRecipes ? 8 : 24,
                  marginBottom: 16,
                  paddingVertical: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text
                    style={{ fontSize: 20, fontWeight: "600", color: theme.text }}
                  >
                    Custom Recipes
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.tint + "30",
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: theme.tint,
                      }}
                    >
                      {customRecipes.length}
                    </Text>
                  </View>
                </View>
                <ChevronRight 
                  size={20} 
                  color={theme.icon}
                  style={{
                    transform: [{ rotate: showCustomRecipes ? '90deg' : '0deg' }]
                  }}
                />
              </TouchableOpacity>

              {showCustomRecipes && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardWidth}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingRight: 80 }}
                >
                  {customRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      {...recipe}
                      isBookmarked={false}
                      isCustom={true}
                      onPress={handleRecipePress}
                      onToggleBookmark={() => {}}
                      onAddToLog={(mealType) => addCustomRecipeToLog(recipe, mealType)}
                      onDelete={() => handleDeleteCustomRecipe(recipe.id)}
                      onEdit={() => handleEditCustomRecipe(recipe)}
                    />
                  ))}
                </ScrollView>
              )}
            </>
          )}

          <Popup
            visible={isPopUpVisible}
            onClose={() => setIsPopUpVisible(false)}
            title=" "
            recipeId={selectedRecipeID}
            isBookmarked={bookmarkedRecipes.includes(selectedRecipeID)}
            onToggleBookmark={toggleBookmark}
            allRecipes={allRecipes}
          >
            <Text> </Text>
          </Popup>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="MANUAL"
                onPress={handleManualEntry}
                icon={TableOfContents}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="CAMERA"
                onPress={handleCameraEntry}
                icon={Camera}
              />
            </View>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: theme.background,
              borderRadius: 16,
              padding: 24,
              width: "85%",
              maxWidth: 400,
              borderWidth: 2,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 12,
              }}
            >
              Delete Recipe?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                marginBottom: 24,
                lineHeight: 22,
              }}
            >
              Are you sure you want to delete this recipe? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setRecipeToDelete(null);
                }}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: theme.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: "#FF6B6B",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Floating Action Button for Food Log */}
      <TouchableOpacity
        onPress={handleFoodLog}
        activeOpacity={0.7}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          backgroundColor: theme.tint,
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          zIndex: 1000,
        }}
      >
        <BookOpen size={28} color={theme.background} strokeWidth={2.5} />
        {foodLogCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: "#FF6B6B",
              width: 24,
              height: 24,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: theme.background,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              {foodLogCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
});