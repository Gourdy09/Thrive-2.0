import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
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

interface ManualEntryScreenProps {
  //if needed
}

export default function ManualEntryScreen(props: ManualEntryScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [recipe, onChangeRecipe] = useState("");
  const [ingredients, onChangeIngredients] = useState("");
  const [instructions, onChangeInstructions] = useState("");
  const [completionTime, onChangeCT] = useState("");
  const [protein, onChangeProtein] = useState("");
  const [carbs, onChangeCarbs] = useState("");

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
        <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
          <Header username="{username}" icon="Hamburger" />
          <TouchableOpacity
            onPress={() => router.back()}
            focusable={false}
            accessible={false}
            style={{ padding: 8, marginRight: 12 }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "bold" }}>
            Manual Entry
          </Text>

          <View style={{ padding: 16 }}>
            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Recipe Name
            </Text>
            <TextInput
              onChangeText={onChangeRecipe}
              value={recipe}
              placeholder="Enter recipe name"
              placeholderTextColor={theme.icon}
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
            />

            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Ingredients (comma separated)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                minHeight: 100,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
              onChangeText={onChangeIngredients}
              value={ingredients}
              placeholder="Enter ingredients"
              placeholderTextColor={theme.icon}
              multiline
            />

            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Instructions
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                minHeight: 150,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
              onChangeText={onChangeInstructions}
              value={instructions}
              placeholder="Enter instructions"
              placeholderTextColor={theme.icon}
              multiline
            />

            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Completion Time (minutes)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
              onChangeText={onChangeCT}
              value={completionTime}
              placeholder="Enter time in minutes"
              placeholderTextColor={theme.icon}
              keyboardType="numeric"
            />

            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Protein (g)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
              onChangeText={onChangeProtein}
              value={protein}
              placeholder="Enter protein in grams"
              placeholderTextColor={theme.icon}
              keyboardType="numeric"
            />

            <Text style={{ color: theme.text, marginBottom: 8 }}>
              Carbs (g)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.cardBackground,
                color: theme.text,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 16,
                textAlign: "center",
                borderBottomWidth: 2,
                marginRight: 8,
                paddingVertical: 4,
              }}
              onChangeText={onChangeCarbs}
              value={carbs}
              placeholder="Enter carbs in grams"
              placeholderTextColor={theme.icon}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={{
                backgroundColor: theme.tint,
                padding: 16,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 32,
              }}
              onPress={() => {
                //Save logic  add
                const data: ManualEntryData = {
                  recipeName: recipe,
                  ingredients: ingredients.split(",").map((i) => i.trim()),
                  instructions: instructions
                    .split("\n")
                    .filter((i) => i.trim()),
                  completionTime: parseInt(completionTime) || 0,
                  protein: parseFloat(protein) || 0,
                  carbs: parseFloat(carbs) || 0,
                };
                console.log("Saving:", data);
                //Save logic  add
              }}
            >
              <Text
                style={{
                  color: "#ffffffff",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Save Recipe
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
