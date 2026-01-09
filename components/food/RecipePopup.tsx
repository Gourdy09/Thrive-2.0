import { Colors } from "@/constants/Colors";
import { RecipeFull } from "@/types/food";
import { Bookmark, Plus } from "lucide-react-native";
import React from "react";
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

interface RecipePopupContentProps {
  recipe: RecipeFull;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const RecipePopupContent: React.FC<RecipePopupContentProps> = ({
  recipe,
  isBookmarked,
  onToggleBookmark,
}) => {
  const theme = Colors[useColorScheme() ?? "dark"];

  return (
    <ScrollView style={{ backgroundColor: theme.background }}>
      <Image source={{ uri: recipe.imageUrl }} style={{ height: 260 }} />

      <TouchableOpacity
        onPress={() => onToggleBookmark(recipe.id)}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "white",
          padding: 8,
          borderRadius: 20,
        }}
      >
        <Bookmark
          size={20}
          color={isBookmarked ? "#FF6B6B" : "#666"}
          fill={isBookmarked ? "#FF6B6B" : "none"}
        />
      </TouchableOpacity>

      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: theme.text,
            marginBottom: 12,
          }}
        >
          {recipe.title}
        </Text>

        <View style={{ flexDirection: "row", gap: 16, marginBottom: 20 }}>
          <Text style={{ color: theme.text }}>
            ⏱ {recipe.cT}
          </Text>
          <Text style={{ color: theme.text }}>
            🍽 {recipe.servingSize}
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: theme.tint,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 20,
          }}
          onPress={() => Alert.alert("Added to Food Log")}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Plus color={theme.background} />
            <Text style={{ color: theme.background, fontWeight: "700" }}>
              Add to Food Log
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={{ fontWeight: "700", marginBottom: 6 }}>Ingredients</Text>
        {recipe.ingredients.map((item, i) => (
          <Text key={i} style={{ color: theme.text }}>
            • {item}
          </Text>
        ))}

        <Text style={{ fontWeight: "700", marginVertical: 12 }}>
          Instructions
        </Text>
        {recipe.instructions.map((step, i) => (
          <Text key={i} style={{ color: theme.text, marginBottom: 6 }}>
            {i + 1}. {step}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default RecipePopupContent;
