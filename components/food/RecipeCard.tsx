import { Colors } from "@/constants/Colors";
import { Bookmark } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image as RNImage,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  onPress?: (id: string) => void;
}

const RecipeCard: React.FC<RecipeData> = ({
  id,
  title,
  imageUrl,
  ingredients,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      <TouchableOpacity onPress={() => onPress?.(id)} activeOpacity={0.7}>
        <RNImage
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsBookmarked(!isBookmarked)}
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
      >
        <Bookmark
          size={20}
          color={isBookmarked ? "#FF6B6B" : "#666"}
          fill={isBookmarked ? "#FF6B6B" : "none"}
        />
      </TouchableOpacity>
      <View style={{ padding: 12 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 4,
            color: theme.text,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: theme.icon }}>
          {ingredients.slice(0, 3).join(", ")}
        </Text>
      </View>
    </View>
  );
};

export default RecipeCard;
