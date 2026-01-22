import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Bookmark,
  ChefHat,
  Clock,
  Flame,
  Plus,
  Users,
  X,
} from "lucide-react-native";
import React, { useState } from "react";
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
  isCustom?: boolean;
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

  const router = useRouter();
  const [showMealModal, setShowMealModal] = useState(false);

  const handleAddToLog = () => {
    setShowMealModal(true);
  };

  if (!visible) return null;

  const selectedRecipe = allRecipes.find((recipe) => recipe.id === recipeId);
  if (!selectedRecipe) return null;
  const isCustomRecipe = selectedRecipe?.id?.startsWith('custom-');

  const handleBookmarkToggle = () => {
    onToggleBookmark(recipeId);
  };

  const handleDelete = async () => {
    if (!isCustomRecipe) return;

    Alert.alert(
      "Delete Recipe",
      `Are you sure you want to delete "${selectedRecipe.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const stored = await AsyncStorage.getItem("customRecipes");
              const recipes = stored ? JSON.parse(stored) : [];
              const updated = recipes.filter((r: any) => r.id !== selectedRecipe.id);
              await AsyncStorage.setItem("customRecipes", JSON.stringify(updated));

              Alert.alert("Success", "Recipe deleted successfully");
              onClose();
            } catch (error) {
              console.error("Error deleting recipe:", error);
              Alert.alert("Error", "Failed to delete recipe");
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!isCustomRecipe) return;
    onClose(); // Close the modal
    router.push({
      pathname: "/(tabs)/food/editRecipeScreen",
      params: { recipeData: JSON.stringify(selectedRecipe) }
    });
  };

  const handleMealTypeSelect = async (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    try {
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
          fiber: selectedRecipe.nutrition?.fiber || 0
        },
        imageUrl: selectedRecipe.imageUrl,
      };

      // Load and update daily food log
      const stored = await AsyncStorage.getItem("foodLog");
      const currentLog = stored ? JSON.parse(stored) : [];
      const updatedLog = [logEntry, ...currentLog];
      await AsyncStorage.setItem("foodLog", JSON.stringify(updatedLog));

      const weeklyStored = await AsyncStorage.getItem("weeklyInsightsData");
      const weeklyData = weeklyStored ? JSON.parse(weeklyStored) : [];
      const updatedWeeklyData = [logEntry, ...weeklyData];
      await AsyncStorage.setItem("weeklyInsightsData", JSON.stringify(updatedWeeklyData));

      Alert.alert("Added to Food Log", `${selectedRecipe.title} has been logged for ${mealType}`);
      setShowMealModal(false);
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
                onPress={handleAddToLog}
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

              {/* Modify */}
              {selectedRecipe.isCustom ? (
                <View style={{ display: "flex", flexDirection: "row", gap: 16 }}>
                  <TouchableOpacity style={{
                    backgroundColor: theme.tint,
                    borderRadius: 16,
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 14
                  }}
                    onPress={() => handleEdit()}
                  >
                    <Text style={{color: theme.background}}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{
                    backgroundColor: theme.background,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: "#ef4444",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 14
                  }}
                    onPress={() => handleDelete()}
                  >
                    <Text style={{ color: "#ef4444" }}>
                      Delete
                    </Text>

                  </TouchableOpacity>
                </View>
              )
                :
                (<View />)
              }

            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
}
export default Popup;