import { Colors } from "@/constants/Colors";
import { RecipeBase } from "@/types/food";
import { Bookmark } from "lucide-react-native";
import React from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

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
  const { id, title, imageUrl, protein = 0, carbs = 0, tags = [] } = recipe;

  const chips: string[] = [];
  if (protein >= 20) chips.push("High Protein");
  if (carbs <= 15) chips.push("Low Carb");
  if (tags.includes("Vegetarian")) chips.push("Vegetarian");

  return (
    <View
      style={{
        width: 280,
        marginRight: 16,
        borderRadius: 14,
        backgroundColor: theme.cardBackground,
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
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>

        {chips.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {chips.map((chip) => (
              <View
                key={chip}
                style={{
                  backgroundColor: theme.tint + "30",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 11, color: theme.tint }}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          onPress={() => onPress(id)}
          style={{
            marginTop: 12,
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