import useMockWebscrape from "@/components/food/mockWebscrape";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface RecipeData {
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
}
const RecipeCard = ({ url }: { url: string }) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { recipeData, loading } = useMockWebscrape(url);

  if (loading) {
    return (
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
    );
  }

  if (!recipeData) return null;

  return (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 12,
        overflow: "hidden",
        marginRight: 16,
        width: 280,
      }}
    >
      <RNImage
        source={{ uri: recipeData.imageUrl }}
        style={{ width: "100%", height: 160 }}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "white",
          padding: 8,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      ></TouchableOpacity>
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
            color: theme.text,
          }}
        >
          {recipeData.title}
        </Text>
        <Text style={{ fontSize: 12, color: theme.icon }}>
          {recipeData.ingredients.slice(0, 3).join(", ")}
        </Text>
      </View>
    </View>
  );
};

export default function allRecipesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      <Header username="{Username}" icon="Hamburger" />
      <ScrollView>
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
              onPress={() => router.back()}
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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
