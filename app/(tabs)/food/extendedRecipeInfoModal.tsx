import useMockWebscrape from "@/components/food/mockWebscrape";
import RecipeCard from "@/components/food/RecipeCard";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface PopUpProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  recipeId: string;
}

const colorScheme = useColorScheme() ?? "dark";
const theme = Colors[colorScheme];

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
      <View style={styles.overLay}>
        <View style={styles.popup}>
          {title && <Text style={styles.title}>{title}</Text>}
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
          {!loading && !error && selectedRecipe && (
            <RecipeCard
              key={selectedRecipe.id}
              {...selectedRecipe}
              isInPopUp={true}
            />
          )}
          <View style={styles.content}>{children}</View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overLay: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: theme.background,
    padding: 10,
    borderRadius: 10,
    width: 100,
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  content: {
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: theme.tint,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeText: {
    color: theme.text,
    fontWeight: 400,
  },
});
export default Popup;
