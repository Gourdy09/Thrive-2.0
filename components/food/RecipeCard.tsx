import IconLoader from "@/app/(tabs)/food/IconLoader";
import { Colors } from "@/constants/Colors";
import { Bookmark, HandPlatter, LucideClock } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image as RNImage,
  ScrollView,
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
  onPress?: (id: string) => void;
  cT: string;
}

interface PopUpInfo extends RecipeData {
  instructions: string[];
  cT: string;
  protein: number;
  carbs: number;
  tags: string[];
  servingSize: string;
  isInPopUp: true;
  onPress?: (id: string) => void;
}

interface ListRecipeData extends RecipeData {
  isInPopUp?: false;
}

export type RecipeCardProps = PopUpInfo | ListRecipeData;

interface IconWrapperProps {
  icon: React.ComponentType<any>;
  text: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  text,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ marginRight: 8 }}>
        <Icon size={20} color={theme.icon} />
      </View>
      <Text style={{ marginRight: 10, color: theme.text }}>{text}</Text>
    </View>
  );
};

const RecipeCard: React.FC<RecipeCardProps> = (props) => {
  const { id, title, imageUrl, ingredients } = props;
  const isInPopUp = "isInPopUp" in props && props.isInPopUp;

  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [isBookmarked, setIsBookmarked] = useState(false);

  if (isInPopUp) {
<<<<<<< Updated upstream
    const { cT, servingSize, tags } = props;
    return (
      <ScrollView
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          overflow: "hidden",
          width: 300,
=======
    const { cT, servingSize, tags, ingredients } = props;
    return (
      <ScrollView
        style={{
          backgroundColor: theme.background,
          width: "100%", // Changed from 300
>>>>>>> Stashed changes
        }}
      >
        {/* Image Section */}
        <View style={{ position: "relative" }}>
          <RNImage
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 250 }}
            resizeMode="cover"
          />
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
        </View>

        {/* Content Section */}
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: -20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              marginBottom: 12,
              color: theme.text,
            }}
          >
            {title}
          </Text>

          {/* Info Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <IconWrapper icon={LucideClock} text={cT} />
            <IconWrapper icon={HandPlatter} text={servingSize} />
          </View>

          {/* Tags Section */}
          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
              letterSpacing: 0.5,
            }}
          >
            TAGS
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            {tags.map((tag) => {
              const Icon = IconLoader(tag);
              return Icon ? (
                <View
                  key={tag}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.cardBackground,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                    marginBottom: 8,
                  }}
                >
                  <Icon size={16} color={theme.icon} />
                  <Text
                    style={{ color: theme.text, fontSize: 12, marginLeft: 6 }}
                  >
                    {tag}
                  </Text>
                </View>
              ) : null;
            })}
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
              letterSpacing: 0.5,
            }}
          >
            INGREDIENTS
          </Text>
<<<<<<< Updated upstream
=======
          <View style={{ marginBottom: 20 }}>
            {ingredients.map((ingredient, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: theme.icon, marginRight: 8 }}>•</Text>
                <Text style={{ color: theme.text, flex: 1, lineHeight: 20 }}>
                  {ingredient}
                </Text>
              </View>
            ))}
          </View>
>>>>>>> Stashed changes
        </View>
      </ScrollView>
    );
  } else {
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
        <TouchableOpacity
          onPress={() => props.onPress?.(id)}
          activeOpacity={0.7}
        >
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
            {ingredients.slice(0, 3).join(",  ")}
          </Text>
        </View>
      </View>
    );
  }
};

export default RecipeCard;
