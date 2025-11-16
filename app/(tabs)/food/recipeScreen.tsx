import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
export default function recipeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  return (
    <View>
      <Header username="{username}" icon="Hamburger" />
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/food/foodScreen")}
        style={{
          padding: 8,
          marginRight: 12,
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
      </TouchableOpacity>
      <Text>recipeScreen</Text>
    </View>
  );
}
