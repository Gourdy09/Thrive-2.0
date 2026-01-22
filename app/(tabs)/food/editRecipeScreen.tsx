import ImagePickerComponent from "@/components/food/ImagePickerComponent";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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
  totalTime?: string;
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

export default function EditRecipeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";

  const [recipeId, setRecipeId] = useState("");
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [time, setTime] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [fiber, setFiber] = useState("");
  const [calories, setCalories] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);

  const onChangeTitle = (text: string) => setTitle(text);
  const onChangeIngredients = (text: string) => setIngredients(text);
  const onChangeInstructions = (text: string) => setInstructions(text);
  const onChangeCookTime = (text: string) => setTime(text);
  const onChangeProtein = (text: string) => setProtein(text);
  const onChangeCarbs = (text: string) => setCarbs(text);
  const onChangeFat = (text: string) => setFat(text);
  const onChangeFiber = (text: string) => setFiber(text);
  const onChangeCalories = (text: string) => setCalories(text);

  const AVAILABLE_TAGS = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Snack",
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dessert",
    "Quick",
    "Healthy"
  ];

  useEffect(() => {
    if (!params.recipeData) return;

    const recipe: RecipeData = JSON.parse(params.recipeData as string);
    setRecipeId(recipe.id);
    setTitle(recipe.title);
    setIngredients(recipe.ingredients.join(", "));
    setInstructions(recipe.instructions.join("\n"));
    setTime(recipe.totalTime?.replace(" min", "") || "");
    setImageUrl(recipe.imageUrl || "");
    setTags(recipe.tags || []);

    const n = recipe.nutrition ?? {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
    };

    setProtein(n.protein.toString());
    setCarbs(n.carbs.toString());
    setFat(n.fat.toString());
    setFiber(n.fiber.toString());
    setCalories(n.calories.toString());
  }, [params.recipeData]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const isFormValid =
    title.trim().length > 0 &&
    ingredients.trim().length > 0 &&
    protein !== "" &&
    carbs !== "" &&
    fat !== "" &&
    fiber !== "" &&
    calories !== "";

  const handleSave = async () => {
    if (!title.trim() || !ingredients.trim()) {
      Alert.alert("Error", "Recipe name and ingredients are required");
      return;
    }

    const updatedRecipe: RecipeData = {
      id: recipeId,
      title,
      imageUrl:
        imageUrl ||
        "https://via.placeholder.com/280x160/4ECDC4/FFFFFF?text=Custom+Recipe",
      ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean),
      instructions: instructions.split("\n").filter(Boolean),
      totalTime: time ? `${time} min` : "N/A",
      servings: "1 serving",
      nutrition: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        calories: parseFloat(calories) || 0,
      },
      tags: tags.length ? tags : ["Custom"],
      difficulty: "Easy",
      cuisine: "Custom",
      isCustom: true,
      isBookmarked: false,
    };

    const stored = await AsyncStorage.getItem("customRecipes");
    const recipes = stored ? JSON.parse(stored) : [];
    const updated = recipes.map((r: RecipeData) =>
      r.id === recipeId ? updatedRecipe : r
    );

    await AsyncStorage.setItem("customRecipes", JSON.stringify(updated));
    Alert.alert("Success", "Recipe updated", [{ text: "OK", onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}>
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
            Edit Recipe
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
              onChangeText={onChangeTitle}
              value={title}
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
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
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

          {/* Nutrition Info Row */}
          <View
            style={{
              flexDirection: "column",
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
                onChangeText={onChangeCookTime}
                value={time}
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

            {/* Fat */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Fat (g)
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
                onChangeText={onChangeFat}
                value={fat}
                placeholder="15"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Fiber */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Fiber (g)
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
                onChangeText={onChangeFiber}
                value={fiber}
                placeholder="15"
                placeholderTextColor={theme.icon}
                keyboardType="numeric"
              />
            </View>

            {/* Calories */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: theme.text,
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                Calories (cal)
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
                onChangeText={onChangeCalories}
                value={calories}
                placeholder="15"
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
            <Save
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
              Save Changes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
