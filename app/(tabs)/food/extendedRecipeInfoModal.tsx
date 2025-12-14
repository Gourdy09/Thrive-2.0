// app/(tabs)/food/extendedRecipeInfoModal.tsx
import RecipeCard from "@/components/food/RecipeCard";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  cT: string;
  protein: number;
  carbs: number;
  tags: string[];
  servingSize: string;
}

interface PopUpProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  recipeId: string;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  allRecipes: RecipeData[];
}

const Popup: React.FC<PopUpProps> = ({
  visible,
  onClose,
  title,
  children,
  recipeId,
  isBookmarked,
  onToggleBookmark,
  allRecipes,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  
  if (!visible) return null;
  
  const selectedRecipe = allRecipes.find((recipe) => recipe.id === recipeId);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "90%",
          }}
        >
          <ScrollView
            style={{
              backgroundColor: theme.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <View
              style={{
                backgroundColor: theme.background,
                padding: 10,
                borderRadius: 10,
              }}
            >
              {title && (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 15,
                  }}
                >
                  {title}
                </Text>
              )}
              {!selectedRecipe ? (
                <View
                  style={{
                    width: 280,
                    marginRight: 16,
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <ActivityIndicator size="large" color={theme.tint} />
                  <Text style={{ color: theme.text, marginTop: 16 }}>Loading recipe...</Text>
                </View>
              ) : (
                <RecipeCard
                  {...selectedRecipe}
                  key={selectedRecipe.id}
                  isInPopUp={true}
                  isBookmarked={isBookmarked}
                  onToggleBookmark={onToggleBookmark}
                />
              )}
              <View style={{ marginBottom: 20 }}>{children}</View>
              <Pressable
                style={{
                  backgroundColor: theme.tint,
                  padding: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  marginBottom: 20,
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    color: theme.background,
                    fontWeight: "600",
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;