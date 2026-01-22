import ImagePickerComponent from "@/components/food/ImagePickerComponent";
import Header from "@/components/Header";
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
  cT: string;
  protein: number;
  carbs: number;
  tags: string[];
  servingSize: string;
  isCustom: boolean;
}

export default function EditRecipeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const params = useLocalSearchParams();

  const [recipeId, setRecipeId] = useState("");
  const [recipe, onChangeRecipe] = useState("");
  const [ingredients, onChangeIngredients] = useState("");
  const [instructions, onChangeInstructions] = useState("");
  const [completionTime, onChangeCT] = useState("");
  const [protein, onChangeProtein] = useState("");
  const [carbs, onChangeCarbs] = useState("");
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

  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";

  useEffect(() => {
    if (params.recipeData) {
      try {
        const recipeData: RecipeData = JSON.parse(params.recipeData as string);
        setRecipeId(recipeData.id);
        onChangeRecipe(recipeData.title);
        onChangeIngredients(recipeData.ingredients.join(", "));
        onChangeInstructions(recipeData.instructions.join("\n"));
        onChangeCT(recipeData.cT.replace(" min", ""));
        onChangeProtein(recipeData.protein.toString());
        onChangeCarbs(recipeData.carbs.toString());
        setImageUrl(recipeData.imageUrl || "");
        setSelectedTags(recipeData.tags || []);
      } catch (error) {
        console.error("Error parsing recipe data:", error);
        Alert.alert("Error", "Failed to load recipe data");
        router.back();
      }
    }
  }, [params]);

  const isFormValid = recipe.trim() !== "" && ingredients.trim() !== "";

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Error",
        "Please fill in at least the recipe name and ingredients"
      );
      return;
    }

    try {
      const updatedRecipe = {
        id: recipeId,
        title: recipe,
        imageUrl: imageUrl || "https://via.placeholder.com/280x160/4ECDC4/FFFFFF?text=Custom+Recipe",
        ingredients: ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        instructions: instructions.split("\n").filter((i) => i.trim()),
        cT: completionTime ? `${completionTime} min` : "N/A",
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        tags: selectedTags.length > 0 ? selectedTags : ["Custom"],
        servingSize: "1 serving",
        isBookmarked: false,
        isCustom: true,
      };

      const stored = await AsyncStorage.getItem("customRecipes");
      const currentRecipes = stored ? JSON.parse(stored) : [];

      const updatedRecipes = currentRecipes.map((r: RecipeData) =>
        r.id === recipeId ? updatedRecipe : r
      );

      await AsyncStorage.setItem(
        "customRecipes",
        JSON.stringify(updatedRecipes)
      );

      Alert.alert("Success", "Recipe updated!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating recipe:", error);
      Alert.alert("Error", "Failed to update recipe");
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

          {/* Image URL */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: theme.text,
                marginBottom: 8,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Image URL (Optional)
            </Text>
            <Text
              style={{
                color: theme.icon,
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              Paste an image URL or leave blank for default
            </Text>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={theme.icon}
              keyboardType="url"
              autoCapitalize="none"
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