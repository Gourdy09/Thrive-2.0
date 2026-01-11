import { Colors } from "@/constants/Colors";
import {
  Bookmark,
  ChefHat,
  Clock,
  Flame,
  Plus,
  Users,
  X,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Modal,
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

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
}

interface PopUpProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  recipeId: string;
  allRecipes: RecipeData[];
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const Popup: React.FC<PopUpProps> = ({
  visible,
  onClose,
  recipeId,
  allRecipes,
  isBookmarked,
  onToggleBookmark,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  if (!visible) return null;

  const selectedRecipe = allRecipes.find((recipe) => recipe.id === recipeId);

  if (!selectedRecipe) return null;

  const handleBookmarkToggle = () => {
    onToggleBookmark(recipeId);
  };

  const showMealTypeOptions = () => {
    Alert.alert("Add to Food Log", "Select meal type", [
      {
        text: "Breakfast",
        onPress: () => addToFoodLog("breakfast"),
      },
      { text: "Lunch", onPress: () => addToFoodLog("lunch") },
      { text: "Dinner", onPress: () => addToFoodLog("dinner") },
      { text: "Snack", onPress: () => addToFoodLog("snack") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const addToFoodLog = async (
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  ) => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      
      const logEntry = {
        id: Date.now().toString(),
        recipeId: selectedRecipe.id,
        recipeName: selectedRecipe.title,
        timestamp: new Date().toISOString(),
        mealType: mealType,
        nutrition: {
          protein: selectedRecipe.nutrition?.protein || 0,
          carbs: selectedRecipe.nutrition?.carbs || 0,
          calories: selectedRecipe.nutrition?.calories || 0,
        },
        imageUrl: selectedRecipe.imageUrl,
      };

      console.log("Adding entry to food log:", logEntry);

      // Load and update daily food log
      const stored = await AsyncStorage.getItem("foodLog");
      const currentLog = stored ? JSON.parse(stored) : [];
      const updatedLog = [logEntry, ...currentLog];
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));
      
      console.log("Daily food log updated. Total entries:", updatedLog.length);

      // Load and update weekly insights data
      const weeklyStored = await AsyncStorage.getItem("weeklyInsightsData");
      const weeklyData = weeklyStored ? JSON.parse(weeklyStored) : [];
      const updatedWeeklyData = [logEntry, ...weeklyData];
      await AsyncStorage.setItem("weeklyInsightsData", JSON.stringify(updatedWeeklyData));
      
      console.log("Weekly insights updated. Total entries:", updatedWeeklyData.length);

      Alert.alert(
        "Added to Food Log",
        `${selectedRecipe.title} has been logged for ${mealType}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding to food log:", error);
      Alert.alert("Error", "Failed to add to food log");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "95%",
          }}
        >
          <ScrollView
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Header with Overlay Actions */}
            <View style={{ position: "relative" }}>
              <RNImage
                source={{ uri: selectedRecipe.imageUrl }}
                style={{ width: "100%", height: 280 }}
                resizeMode="cover"
              />

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>

              {/* Bookmark Button */}
              <TouchableOpacity
                onPress={handleBookmarkToggle}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(255,255,255,0.95)",
                  padding: 10,
                  borderRadius: 20,
                }}
              >
                <Bookmark
                  size={24}
                  color={isBookmarked ? "#FF6B6B" : "#666"}
                  fill={isBookmarked ? "#FF6B6B" : "none"}
                />
              </TouchableOpacity>

              {/* Difficulty Badge */}
              {selectedRecipe.difficulty && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    backgroundColor: theme.tint,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: theme.background,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {selectedRecipe.difficulty}
                  </Text>
                </View>
              )}

              {/* Cuisine Badge */}
              {selectedRecipe.cuisine && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    backgroundColor: "rgba(0,0,0,0.7)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {selectedRecipe.cuisine}
                  </Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={{ padding: 20 }}>
              {/* Title */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: theme.text,
                  marginBottom: 12,
                  lineHeight: 34,
                }}
              >
                {selectedRecipe.title}
              </Text>

              {/* Quick Info Row */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {selectedRecipe.totalTime && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={18} color={theme.icon} />
                    <Text
                      style={{
                        marginLeft: 6,
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {selectedRecipe.totalTime}
                    </Text>
                  </View>
                )}
                {selectedRecipe.servings && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Users size={18} color={theme.icon} />
                    <Text
                      style={{
                        marginLeft: 6,
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {selectedRecipe.servings}
                    </Text>
                  </View>
                )}
                {selectedRecipe.nutrition?.calories && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Flame size={18} color="#FF6B6B" />
                    <Text
                      style={{
                        marginLeft: 6,
                        color: theme.text,
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {selectedRecipe.nutrition.calories} cal
                    </Text>
                  </View>
                )}
              </View>

              {/* Add to Food Log Button */}
              <TouchableOpacity
                onPress={showMealTypeOptions}
                style={{
                  backgroundColor: theme.tint,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 24,
                  gap: 8,
                }}
              >
                <Plus size={22} color={theme.background} />
                <Text
                  style={{
                    color: theme.background,
                    fontSize: 17,
                    fontWeight: "700",
                  }}
                >
                  Add to Food Log
                </Text>
              </TouchableOpacity>

              {/* Nutrition Info Card */}
              {selectedRecipe.nutrition && (
                <View
                  style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: 16,
                    padding: 16,
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
                    <ChefHat size={20} color={theme.tint} />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: theme.text,
                        marginLeft: 8,
                      }}
                    >
                      Nutrition Facts
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <NutritionItem
                      label="Protein"
                      value={`${selectedRecipe.nutrition.protein}g`}
                      color="#4ECDC4"
                    />
                    <NutritionItem
                      label="Carbs"
                      value={`${selectedRecipe.nutrition.carbs}g`}
                      color="#FF6B6B"
                    />
                    {selectedRecipe.nutrition.fat !== undefined && (
                      <NutritionItem
                        label="Fat"
                        value={`${selectedRecipe.nutrition.fat}g`}
                        color="#FFA07A"
                      />
                    )}
                    {selectedRecipe.nutrition.fiber !== undefined && (
                      <NutritionItem
                        label="Fiber"
                        value={`${selectedRecipe.nutrition.fiber}g`}
                        color="#95E1D3"
                      />
                    )}
                  </View>
                </View>
              )}

              {/* Tags */}
              {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                <View style={{ marginBottom: 24 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: theme.icon,
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Tags
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {selectedRecipe.tags.map((tag, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: theme.tint + "20",
                          borderWidth: 1,
                          borderColor: theme.icon,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 9,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.tint,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Ingredients */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.text,
                    marginBottom: 12,
                  }}
                >
                  Ingredients
                </Text>
                <View
                  style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 2,
                    borderColor: theme.border,
                  }}
                >
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        marginBottom: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <View
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: theme.tint,
                          marginTop: 6,
                          marginRight: 12,
                        }}
                      />
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 15,
                          flex: 1,
                          lineHeight: 22,
                        }}
                      >
                        {ingredient}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Instructions */}
              {selectedRecipe.instructions &&
                selectedRecipe.instructions.length > 0 && (
                  <View style={{ marginBottom: 32 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: theme.text,
                        marginBottom: 12,
                      }}
                    >
                      Instructions
                    </Text>
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          marginBottom: 16,
                          alignItems: "flex-start",
                        }}
                      >
                        <View
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: theme.tint,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.background,
                              fontSize: 14,
                              fontWeight: "700",
                            }}
                          >
                            {index + 1}
                          </Text>
                        </View>
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: 15,
                            flex: 1,
                            lineHeight: 24,
                          }}
                        >
                          {instruction}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Nutrition Item Component
function NutritionItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flex: 1,
        minWidth: "45%",
        backgroundColor: color + "20",
        borderWidth: 1,
        borderColor: color + "40",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: theme.icon,
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: theme.text,
          fontSize: 20,
          fontWeight: "800",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default Popup;