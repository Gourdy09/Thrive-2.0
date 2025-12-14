import IconLoader from "@/app/(tabs)/food/IconLoader";
import { Colors } from "@/constants/Colors";
import { Bookmark, HandPlatter, LucideClock, Plus } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Image as RNImage,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

interface RecipeData {
  id: string;
  title: string;
  imageUrl: string;
  ingredients: string[];
  onPress?: (id: string) => void;
  onToggleBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  cT: string;
  protein?: number;
  carbs?: number;
  tags?: string[];
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
  const { id, title, imageUrl, ingredients, isBookmarked = false, onToggleBookmark } = props;
  const isInPopUp = "isInPopUp" in props && props.isInPopUp;

  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const ingredientsListObject = ingredients.map((value, index) => ({
    id: index.toString(),
    title: value,
  }));

  type ItemProps = { title: string };
  const Item = ({ title }: ItemProps) => (
    <View style={{ flexDirection: "row", marginBottom: 4 }}>
      <Text style={{ marginRight: 6, color: theme.text }}>•</Text>
      <Text style={{ color: theme.text }}>{title}</Text>
    </View>
  );

  const handleBookmarkToggle = (e: any) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(id);
    }
  };

  const addToFoodLog = async (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      const logEntry = {
        id: Date.now().toString(),
        recipeId: id,
        recipeName: title,
        timestamp: new Date().toISOString(),
        mealType: mealType || 'snack',
        nutrition: {
          protein: isInPopUp ? (props as PopUpInfo).protein : 0,
          carbs: isInPopUp ? (props as PopUpInfo).carbs : 0,
          calories: isInPopUp ? ((props as PopUpInfo).protein * 4 + (props as PopUpInfo).carbs * 4) : 0,
        },
        imageUrl,
      };

      // Save to AsyncStorage - ADD to existing log, don't replace
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const stored = await AsyncStorage.getItem('foodLog');
      const currentLog = stored ? JSON.parse(stored) : [];
      
      // Add new entry to the BEGINNING of the array (most recent first)
      const updatedLog = [logEntry, ...currentLog];
      
      await AsyncStorage.setItem('foodLog', JSON.stringify(updatedLog));
      
      console.log("Added to food log:", logEntry);
      console.log("Total entries:", updatedLog.length);
      
      Alert.alert(
        "Added to Food Log",
        `${title} has been logged for ${mealType}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding to food log:", error);
      Alert.alert("Error", "Failed to add to food log");
    }
  };

  const showMealTypeOptions = () => {
    Alert.alert(
      "Add to Food Log",
      "Select meal type",
      [
        { text: "Breakfast", onPress: () => addToFoodLog('breakfast') },
        { text: "Lunch", onPress: () => addToFoodLog('lunch') },
        { text: "Dinner", onPress: () => addToFoodLog('dinner') },
        { text: "Snack", onPress: () => addToFoodLog('snack') },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  if (isInPopUp) {
    const { cT, servingSize, tags, instructions } = props;
    const instructionsListObject = instructions.map((value, index) => ({
      id: index.toString(),
      title: value,
    }));
    
    return (
      <ScrollView
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
        }}
      >
        <View style={{ position: "relative" }}>
          <RNImage
            source={{ uri: imageUrl }}
            style={{ width: "100%", height: 250 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={handleBookmarkToggle}
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
        
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginTop: -20,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: theme.text,
              marginBottom: 16,
            }}
          >
            {title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <IconWrapper icon={LucideClock} text={cT} />
            <IconWrapper icon={HandPlatter} text={servingSize} />
          </View>

          {/* Add to Food Log Button */}
          <TouchableOpacity
            onPress={showMealTypeOptions}
            style={{
              backgroundColor: theme.tint,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              gap: 8,
            }}
          >
            <Plus size={20} color={theme.background} />
            <Text
              style={{
                color: theme.background,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Add to Food Log
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            TAGS
          </Text>
          {tags.map((tag) => {
            const Icon = IconLoader(tag);
            return Icon ? (
              <IconWrapper key={tag} icon={Icon} text={tag} />
            ) : null;
          })}
          
          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            INGREDIENTS
          </Text>
          {ingredientsListObject.map((item) => (
            <Item key={item.id} title={item.title} />
          ))}

          <Text
            style={{
              color: theme.text,
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 10,
              marginTop: 10,
            }}
          >
            INSTRUCTIONS
          </Text>
          {instructionsListObject.map((item) => (
            <Item key={item.id} title={item.title} />
          ))}
        </View>
      </ScrollView>
    );
  } else {
    const { protein = 0, carbs = 0, tags = [] } = props;
    
    // Determine highlight chips based on nutrition and tags
    const chips: { label: string; color: string }[] = [];
    
    if (protein >= 20) chips.push({ label: "High Protein", color: "#FF6B6B" });
    if (carbs <= 15) chips.push({ label: "Low Carb", color: "#4ECDC4" });
    if (tags.includes("Vegetarian") || tags.includes("Vegan")) {
      chips.push({ label: "Vegetarian", color: "#95E1D3" });
    }
    if (tags.includes("Gluten-free")) chips.push({ label: "Gluten-free", color: "#FFA07A" });
    if (tags.includes("Quick")) chips.push({ label: "Quick", color: "#F7DC6F" });
    
    return (
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
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
            style={{ width: "100%", height: 160, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleBookmarkToggle}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
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
              marginBottom: 8,
              color: theme.text,
            }}
          >
            {title}
          </Text>

          {/* Chips for highlights */}
          {chips.length > 0 && (
            <View style={{ 
              flexDirection: "row", 
              flexWrap: "wrap", 
              gap: 6, 
              marginBottom: 12 
            }}>
              {chips.map((chip, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: chip.color + "30",
                    borderColor: chip.color,
                    borderWidth: 1,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: chip.color,
                    }}
                  >
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* View Details Button - Opens Modal */}
          <TouchableOpacity
            onPress={() => props.onPress?.(id)}
            style={{
              backgroundColor: theme.tint,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              gap: 6,
            }}
          >
            <Text
              style={{
                color: theme.background,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
};

export default RecipeCard;