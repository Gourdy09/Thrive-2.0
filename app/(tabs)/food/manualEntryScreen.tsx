import ImagePickerComponent from "@/components/food/ImagePickerComponent";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  completionTime?: string;
  servings?: string;
  nutrition: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    calories: number;
  };
  tags?: string[];
  difficulty?: string;
  cuisine?: string;
  isCustom?: boolean;
  isBookmarked?: boolean;
}


export default function ManualEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [recipe, onChangeRecipe] = useState("");
  const [ingredients, onChangeIngredients] = useState("");
  const [instructions, onChangeInstructions] = useState("");
  const [cookTime, onChangeCookTime] = useState("");
  const [protein, onChangeProtein] = useState("");
  const [carbs, onChangeCarbs] = useState("");
  const [fat, onChangeFat] = useState("");
  const [calories, onChangeCalories] = useState("");
  const [fiber, onChangeFiber] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const AVAILABLE_TAGS = [
    "Vegetarian",
    "Vegan",
    "Gluten-free",
    "Dairy-free",
    "Low Carb",
    "High Protein",
    "Quick",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Dessert",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isFormValid = recipe.trim() !== "" && ingredients.trim() !== "";

  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Error",
        "Please fill in at least the recipe name and ingredients"
      );
      return;
    }

    const data: RecipeData = {
      id: `custom-${Date.now()}`,
      title: recipe,
      imageUrl: imageUrl || "https://via.placeholder.com/280x160/4ECDC4/FFFFFF?text=Custom+Recipe",
      ingredients: ingredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      instructions: instructions.split("\n").filter((i) => i.trim()),
      completionTime: cookTime || "0",
      nutrition: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        calories: parseFloat(calories) || 0
      }
    };

    console.log("Saving:", data);

    try {
      const newRecipe = {
        id: `custom-${Date.now()}`,
        title: data.title,
        imageUrl: imageUrl || "https://via.placeholder.com/280x160/4ECDC4/FFFFFF?text=Custom+Recipe",
        ingredients: data.ingredients,
        instructions: data.instructions,
        cookingTime: data.completionTime ? `${data.completionTime} min` : "N/A",
        prepTime: "N/A",
        totalTime: data.completionTime ? `${data.completionTime} min` : "N/A",
        servings: "1 serving",
        nutrition: {
          protein: data.nutrition.protein,
          carbs: data.nutrition.carbs,
          fat: data.nutrition.fat,
          fiber: data.nutrition.fiber,
          calories: data.nutrition.calories,
        },

        tags: selectedTags.length > 0 ? selectedTags : ["Custom"],
        difficulty: "Easy",
        cuisine: "Custom",
        isBookmarked: false,
        isCustom: true,
      };

      const stored = await AsyncStorage.getItem("customRecipes");
      const currentRecipes = stored ? JSON.parse(stored) : [];
      const updatedRecipes = [...currentRecipes, newRecipe];
      await AsyncStorage.setItem(
        "customRecipes",
        JSON.stringify(updatedRecipes)
      );

      console.log("Recipe saved successfully:", newRecipe);

      Alert.alert("Success", "Recipe saved successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving recipe:", error);
      Alert.alert("Error", "Failed to save recipe. Please try again.");
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
        <Header username={username} icon="Hamburger" />

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
              placeholder="Season the chicken with salt and pepper&#10;Grill for 6-8 minutes per side&#10;Let rest, then slice&#10;Combine with salad ingredients"
              placeholderTextColor={theme.icon}
              multiline
            />
          </View>

          {/* Tags Section */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: theme.text,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Tags (Optional)
            </Text>
            <Text
              style={{
                color: theme.icon,
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              Select tags that describe your recipe
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: isSelected ? theme.tint : theme.border,
                      backgroundColor: isSelected
                        ? theme.tint + "20"
                        : colorScheme === "dark"
                          ? "#1c1e22"
                          : "#f8f9fa",
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? theme.tint : theme.text,
                        fontSize: 14,
                        fontWeight: isSelected ? "600" : "500",
                      }}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Nutrition Info */}
          <View
            style={{
              flexDirection: "column",
              marginBottom: 20,
            }}
          >
            {/* Completion Time */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Time (min)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeCookTime}
                value={cookTime}
                placeholder="30"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Protein */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Protein (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
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
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Carbs (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
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

            {/* Fat */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Fat (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeFat}
                value={fat}
                placeholder="15"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Fiber */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Fiber (g)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeFiber}
                value={fiber}
                placeholder="15"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Calories */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: theme.text, marginBottom: 8, fontSize: 16, fontWeight: "600" }}>
                Calories (cal)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  color: theme.text,
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 16,
                  borderWidth: 2,
                  borderColor: theme.border,
                }}
                onChangeText={onChangeCalories}
                value={calories}
                placeholder="250"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>
          </View>


          {/* Image Picker */}
          <ImagePickerComponent
            currentImage={imageUrl}
            onImageSelected={setImageUrl}
          />

          {/* Save Button */}
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
            onPress={handleSave}
            disabled={!isFormValid}
          >
            <CheckCircle2
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
              Save Recipe
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}