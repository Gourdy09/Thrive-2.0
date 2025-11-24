import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Modal,
  Pressable,
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
}



const Popup: React.FC<PopUpProps> = ({
  visible,
  onClose,
  title,
  children,
  recipeId,
}) => {
  // const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { recipeData, loading, error } = useMockWebscrape();
  if (!visible) return null;
  const selectedRecipe = recipeData.find((recipe) => recipe.id === recipeId);
  return (
    <Modal
      visible={visible}
      transparent={true}
      //animationType='Fade'
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: theme.background,
      }}>
        <View style={{
          backgroundColor: theme.background,
          padding: 10,
          borderRadius: 10,
        }}>
          {title && <Text style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 15,
          }}>{title}</Text>}
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
            />
          )}
          <View style={{marginBottom: 20,}}>{children}</View>
          <Pressable style={{
            backgroundColor: theme.tint,
            padding: 12,
            borderRadius: 10,
            alignItems: "center",
          }} onPress={onClose}>
            <Text style={{
              color: theme.background,
              fontWeight: 400,
            }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
export default Popup;
