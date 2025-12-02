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
import Popup from "./extendedRecipeInfoModal";

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

export default function FoodScreen({ username = "User" }: FoodScreenProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [selectedRecipeID, setSelectedRecipeID] = useState<string>("");
  const { recipeData, loading, error } = useMockWebscrape();

  const handleRecipePress = (recipeID: string) => {
    console.log("Recipe pressed:", recipeID);
    setSelectedRecipeID(recipeID);
    setIsPopUpVisible(true);
  };

  const handleSeeAll = () => router.push("/(tabs)/food/allRecipesScreen");
  const handleManualEntry = () => {
    //Alert.alert("Manual Entry", "Manual Entry Pressed");
    router.push("/(tabs)/food/manualEntryScreen");
  };
  const handleCameraEntry = () =>
    Alert.alert("Camera Entry", "Camera Entry Pressed");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 14,
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
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                  onPress={handleRecipePress}
                />
              ))}

            <Popup
              visible={isPopUpVisible}
              onClose={() => setIsPopUpVisible(false)}
              title=" "
              recipeId={selectedRecipeID}
            >
              <Text> More Stuff</Text>
            </Popup>
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
