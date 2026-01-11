import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
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

  const isFormValid = recipe.trim() !== "" && ingredients.trim() !== "";

  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";
  const handleSave = () => {
    if (!isFormValid) {
      Alert.alert(
        "Error",
        "Please fill in at least the recipe name and ingredients"
      );
      return;
    }

    const data: ManualEntryData = {
      recipeName: recipe,
      ingredients: ingredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      instructions: instructions.split("\n").filter((i) => i.trim()),
      completionTime: parseInt(completionTime) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
    };

    console.log("Saving:", data);
    // TODO: Add save logic to local

    Alert.alert("Success", "Recipe saved successfully!", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
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
