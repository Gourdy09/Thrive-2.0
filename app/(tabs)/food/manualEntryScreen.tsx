import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

export default function manualEntryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <Header username="{Username}" icon="Hamburger" />
      <ScrollView>
        <View style={{ padding: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              focusable={false}
              accessible={false}
              style={{
                padding: 8,
                marginRight: 12,
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                color: theme.text,
              }}
            >
              Manual Entry Screen
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
