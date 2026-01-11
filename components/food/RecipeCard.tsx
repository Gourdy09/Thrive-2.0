import { Colors } from "@/constants/Colors";
import { Bookmark } from "lucide-react-native";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface RecipeBase {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  tags?: string[];
  nutrition?: {
    protein: number;
    carbs: number;
    fat?: number;
    calories?: number;
    fiber?: number;
  };
}

interface RecipeCardProps {
  recipe: RecipeBase;
  isBookmarked: boolean;
  onPress: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isBookmarked,
  onPress,
  onToggleBookmark,
}) => {
  const theme = Colors[useColorScheme() ?? "dark"];
  const { id, title, imageUrl, nutrition, tags = [] } = recipe;

  // Build chips from nutrition and tags
  const chips: string[] = [];
  
  if (nutrition) {
    if (nutrition.protein >= 20) chips.push("High Protein");
    if (nutrition.carbs <= 15) chips.push("Low Carb");
    if (nutrition.calories && nutrition.calories <= 300) chips.push("Low Cal");
  }
  
  // Add dietary tags
  if (tags.includes("Vegetarian")) chips.push("Vegetarian");
  if (tags.includes("Vegan")) chips.push("Vegan");
  if (tags.includes("Gluten-free")) chips.push("Gluten-free");
  if (tags.includes("Quick")) chips.push("Quick");

  // Limit to 3 chips
  const displayChips = chips.slice(0, 3);

  return (
    <View
      style={{
        width: 280,
        marginRight: 16,
        borderRadius: 14,
        backgroundColor: theme.cardBackground,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <TouchableOpacity onPress={() => onPress(id)}>
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: 160,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onToggleBookmark(id)}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          backgroundColor: "white",
          padding: 6,
          borderRadius: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Bookmark
          size={18}
          color={isBookmarked ? "#FF6B6B" : "#777"}
          fill={isBookmarked ? "#FF6B6B" : "none"}
        />
      </TouchableOpacity>

      <View style={{ padding: 12 }}>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>

        {/* Nutrition Quick Stats */}
        {nutrition && (
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.icon }}>
              {nutrition.calories || 0} cal
            </Text>
            <Text style={{ fontSize: 12, color: theme.icon }}>
              {nutrition.protein}g protein
            </Text>
          </View>
        )}

        {displayChips.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {displayChips.map((chip) => (
              <View
                key={chip}
                style={{
                  backgroundColor: theme.tint + "30",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 9,
                  borderColor: theme.icon,
                  borderWidth: 1
                }}
              >
                <Text style={{ fontSize: 11, color: theme.tint, fontWeight: "600" }}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => onPress(id)}
          style={{
            backgroundColor: theme.tint,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.background, fontWeight: "700" }}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecipeCard;