// app/(tabs)/food/manualEntryScreen.tsx
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

interface ManualEntryData {
  recipeName: string;
  ingredients: string[];
  instructions: string[];
  completionTime: number;
  protein: number;
  carbs: number;
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [recipe, onChangeRecipe] = useState("");
  const [ingredients, onChangeIngredients] = useState("");
  const [instructions, onChangeInstructions] = useState("");
  const [completionTime, onChangeCT] = useState("");
  const [protein, onChangeProtein] = useState("");
  const [carbs, onChangeCarbs] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const isFormValid = recipe.trim() !== "" && ingredients.trim() !== "";

  const showSaveOptions = () => {
    if (!isFormValid) {
      return;
    }
    setShowSaveModal(true);
  };

  const handleAddOnce = () => {
    setShowSaveModal(false);
    setShowMealTypeModal(true);
  };

  const addToFoodLog = async (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      const logEntry = {
        id: Date.now().toString(),
        recipeName: recipe,
        timestamp: new Date().toISOString(),
        mealType,
        nutrition: {
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          calories: (parseFloat(protein) || 0) * 4 + (parseFloat(carbs) || 0) * 4,
        },
      };

      const stored = await AsyncStorage.getItem('foodLog');
      const currentLog = stored ? JSON.parse(stored) : [];
      const updatedLog = [logEntry, ...currentLog];
      
      await AsyncStorage.setItem('foodLog', JSON.stringify(updatedLog));
      
      setShowMealTypeModal(false);
      setSuccessMessage("Added to food log!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding to food log:", error);
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const newRecipe = {
        id: `custom-${Date.now()}`,
        title: recipe,
        imageUrl: "",
        ingredients: ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        instructions: instructions.split("\n").filter((i) => i.trim()),
        cT: completionTime ? `${completionTime} min` : "N/A",
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        tags: ["Custom"],
        servingSize: "1 serving",
        isBookmarked: false,
        isCustom: true,
      };

      const customRecipesKey = 'customRecipes';
      const customRecipesStored = await AsyncStorage.getItem(customRecipesKey);
      const currentCustomRecipes = customRecipesStored ? JSON.parse(customRecipesStored) : [];
      
      const updatedCustomRecipes = [...currentCustomRecipes, newRecipe];
      await AsyncStorage.setItem(customRecipesKey, JSON.stringify(updatedCustomRecipes));

      setShowSaveModal(false);
      setSuccessMessage("Recipe saved to your collection!");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          paddingHorizontal: 24,
          paddingTop: 60,
        }}
      >
        <Header username="{username}" icon="Hamburger" />

        {/* Back Button & Title */}
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
              color: theme.text,
              fontSize: 28,
              fontWeight: "700",
            }}
          >
            Add Recipe
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Recipe Name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: theme.text,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Recipe Name *
            </Text>
            <TextInput
              onChangeText={onChangeRecipe}
              value={recipe}
              placeholder="e.g., Grilled Chicken Salad"
              placeholderTextColor={theme.icon}
              style={{
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                color: theme.text,
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 2,
                borderColor: theme.border,
              }}
            />
          </View>

          {/* Ingredients */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: theme.text,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Ingredients *
            </Text>
            <Text
              style={{
                color: theme.icon,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              Separate each ingredient with a comma
            </Text>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                color: theme.text,
                padding: 16,
                borderRadius: 12,
                minHeight: 120,
                fontSize: 16,
                borderWidth: 2,
                borderColor: theme.border,
                textAlignVertical: "top",
              }}
              onChangeText={onChangeIngredients}
              value={ingredients}
              placeholder="2 chicken breasts, 1 cup lettuce, 2 tomatoes, olive oil"
              placeholderTextColor={theme.icon}
              multiline
            />
          </View>

          {/* Instructions */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: theme.text,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Instructions
            </Text>
            <Text
              style={{
                color: theme.icon,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              One step per line
            </Text>
            <TextInput
              style={{
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                color: theme.text,
                padding: 16,
                borderRadius: 12,
                minHeight: 150,
                fontSize: 16,
                borderWidth: 2,
                borderColor: theme.border,
                textAlignVertical: "top",
              }}
              onChangeText={onChangeInstructions}
              value={instructions}
              placeholder="1. Season the chicken with salt and pepper&#10;2. Grill for 6-8 minutes per side&#10;3. Let rest, then slice&#10;4. Combine with salad ingredients"
              placeholderTextColor={theme.icon}
              multiline
            />
          </View>

          {/* Nutrition Info Row */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {/* Completion Time */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Time (min)
              </Text>
              <TextInput
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeCT}
                value={completionTime}
                placeholder="30"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Protein */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Protein (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeProtein}
                value={protein}
                placeholder="25"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Carbs */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Carbs (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeCarbs}
                value={carbs}
                placeholder="15"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isFormValid ? theme.tint : theme.border,
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginTop: 12,
            }}
            onPress={showSaveOptions}
            disabled={!isFormValid}
          >
            <Plus
              size={20}
              color={isFormValid ? theme.background : theme.icon}
            />
            <Text
              style={{
                color: isFormValid ? theme.background : theme.icon,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Add Recipe
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Save Options Modal */}
      {showSaveModal && (
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
              Add Recipe
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                marginBottom: 24,
                lineHeight: 22,
              }}
            >
              Would you like to save this recipe or add it once to your food log?
            </Text>
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleAddOnce}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: theme.tint,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.tint, fontWeight: "700", fontSize: 16 }}>
                  Add Once to Log
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveRecipe}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: theme.tint,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.background, fontWeight: "700", fontSize: 16 }}>
                  Save Recipe
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSaveModal(false)}
                style={{
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
            </View>
          </View>
        </View>
      )}

      {/* Meal Type Modal */}
      {showMealTypeModal && (
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
              Select Meal Type
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                marginBottom: 24,
                lineHeight: 22,
              }}
            >
              When did you eat this?
            </Text>
            <View style={{ gap: 12 }}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
                <TouchableOpacity
                  key={mealType}
                  onPress={() => addToFoodLog(mealType)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: theme.cardBackground,
                    borderWidth: 2,
                    borderColor: theme.border,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowMealTypeModal(false)}
                style={{
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: theme.border,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
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
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 32 }}>✓</Text>
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: theme.text,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Success!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                marginBottom: 24,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {successMessage}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: theme.tint,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={{ color: theme.background, fontWeight: "700", fontSize: 16 }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}