import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
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
}

export default function allRecipesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { recipeData, loading, error } = useMockWebscrape();
  const { user } = useAuth();
  const username = user?.email?.split("@")[0] || "User";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      <Header username={username} icon="Hamburger" />
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/food/foodScreen")}
            focusable={false}
            accessible={false}
            style={{
              padding: 8,
              marginRight: 12,
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: theme.text,
            }}
          >
            All Recipes
          </Text>
          <TouchableOpacity
            focusable={false}
            accessible={false}
            style={{
              padding: 8,
              marginRight: 12,
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          ></TouchableOpacity>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
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
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
      </ScrollView>
    </View>
  );
}
