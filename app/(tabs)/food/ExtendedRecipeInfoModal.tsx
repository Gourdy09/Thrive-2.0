import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View
} from "react-native";

interface PopUpProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  recipeId: string;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

const Popup: React.FC<PopUpProps> = ({
  visible,
  onClose,
  title,
  children,
  recipeId,
  isBookmarked,
  onToggleBookmark,
}) => {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { recipeData, loading, error } = useMockWebscrape();
  
  if (!visible) return null;
  
  const selectedRecipe = recipeData.find((recipe) => recipe.id === recipeId);
  
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
              {loading && (
                <View>
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
              {!loading && !error && selectedRecipe && (
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