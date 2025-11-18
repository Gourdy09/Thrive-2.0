console.log("=== foodScreen.tsx loaded ===");
import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Camera, ChevronRight, TableOfContents } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Popup from "./extendedRecipeInfomodal";

interface RecipeData {
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
}

interface FoodScreenProps {
  recipeUrls?: string[];
  username?: string;
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  icon: Icon,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? theme.cardSelected : theme.cardBackground,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      {Icon && (
        <View style={{ marginBottom: 8 }}>
          <Icon size={60} color={theme.icon} />
        </View>
      )}
      <Text style={{ color: theme.text }}>{title}</Text>
    </Pressable>
  );
};

const RecipeCard: React.FC<RecipeData> = ({ title, imageUrl, ingredients }) => {
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
      <RNImage
        source={{ uri: imageUrl }}
        style={{ width: "100%", height: 160 }}
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

export default function FoodScreen({
  username = "User",
}: FoodScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const { recipeData, loading, error } = useMockWebscrape();
>>>>>>> Stashed changes

  const handleRecipePress = (recipeID: string) => {
    setSelectedRecipeID(recipeID);
    setIsPopUpVisible(true);
  };

  const handleSeeAll = () => router.push("/(tabs)/food/recipeScreen");
  const handleManualEntry = () => {
    Alert.alert("Manual Entry", "Manual Entry Pressed");
    router.push("/(tabs)/food/manualEntryScreen");
  };
  const handleCameraEntry = () =>
    Alert.alert("Camera Entry", "Camera Entry Pressed");

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
      <ScrollView>
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{ fontSize: 25, fontWeight: "bold", color: theme.text }}
            >
              Suggestions
            </Text>
            <TouchableOpacity
              onPress={handleSeeAll}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ color: theme.icon, marginRight: 4 }}>See all</Text>
              <ChevronRight size={16} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
<<<<<<< Updated upstream
            {urlsToRender.map((url, index) => (
              <RecipeCard key={index} url={url} />
            ))}
=======
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
            {!loading && !error && recipeData.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="MANUAL"
                onPress={handleManualEntry}
                icon={TableOfContents}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CustomButton
                title="CAMERA"
                onPress={handleCameraEntry}
                icon={Camera}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
});
