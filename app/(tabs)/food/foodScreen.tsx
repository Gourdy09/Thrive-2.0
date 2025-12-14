import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  View,
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
  const [foodLogCount, setFoodLogCount] = useState(0);
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const { recipeData, loading, error } = useMockWebscrape();
  
  const suggestionsScrollRef = useRef<ScrollView>(null);
  const savedScrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;
  const cardWidth = 280 + 16; // card width + margin

  // Load bookmarked recipes and food log count
  useEffect(() => {
    loadBookmarkedRecipes();
    loadFoodLogCount();
    
    // Listener for food log updates
    const interval = setInterval(loadFoodLogCount, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadBookmarkedRecipes = async () => {
    try {
      const stored = await AsyncStorage.getItem('bookmarkedRecipes');
      if (stored) setBookmarkedRecipes(JSON.parse(stored));
    } catch (error) {
      console.error("Error loading bookmarks:", error);
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
      console.log("Bookmarks saved:", bookmarks);
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
    console.log("Recipe pressed:", recipeID);
    setSelectedRecipeID(recipeID);
    setIsPopUpVisible(true);
  };

  const handleSeeAll = () => router.push("/(tabs)/food/allRecipesScreen");
  const handleManualEntry = () => router.push("/(tabs)/food/manualEntryScreen");
  const handleCameraEntry = () => router.push("/(tabs)/food/cameraScreen");
  const handleFoodLog = () => {
    console.log("Opening food log...");
    try {
      router.push("/(tabs)/food/foodLogScreen");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Coming Soon", "Food log feature will be available soon!");
    }
  };

  // Snap to card on scroll
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

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 14,
        paddingTop: 60,
      }}
    >
      <Header username={username} icon="Hamburger" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
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

          <ScrollView
            ref={suggestionsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => handleScrollEnd(e, suggestionsScrollRef)}
            contentContainerStyle={{ paddingRight: 16 }}
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

          {/* Saved Recipes Section */}
          {savedRecipes.length > 0 && (
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
                  contentContainerStyle={{ paddingRight: 16 }}
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

          <Popup
            visible={isPopUpVisible}
            onClose={() => setIsPopUpVisible(false)}
            title=" "
            recipeId={selectedRecipeID}
            isBookmarked={bookmarkedRecipes.includes(selectedRecipeID)}
            onToggleBookmark={toggleBookmark}
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