import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Droplet } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { completeFirstLaunch } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    await completeFirstLaunch();
    router.replace("/(auth)/login");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 40,
      }}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Logo */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.tint + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <Droplet size={60} color={theme.tint} fill={theme.tint} />
        </View>

        {/* Welcome Text */}
        <Text
          style={{
            fontSize: 36,
            fontWeight: "800",
            color: theme.text,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Welcome to Thrive
        </Text>

        <Text
          style={{
            fontSize: 18,
            color: theme.icon,
            textAlign: "center",
            lineHeight: 26,
            marginBottom: 60,
          }}
        >
          Your personal health companion for managing diabetes and living your
          best life
        </Text>

        {/* Features */}
        <View style={{ width: "100%", marginBottom: 60 }}>
          <FeatureItem
            title="Track Your Health"
            description="Monitor blood glucose levels in real-time"
            theme={theme}
          />
          <FeatureItem
            title="Smart Nutrition"
            description="Get personalized recipe recommendations"
            theme={theme}
          />
          <FeatureItem
            title="Medication Reminders"
            description="Never miss a dose with smart alerts"
            theme={theme}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: theme.tint,
            paddingVertical: 18,
            paddingHorizontal: 60,
            borderRadius: 30,
            shadowColor: theme.tint,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text
            style={{
              color: colorScheme === "dark" ? "#000" : "#fff",
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Get Started
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function FeatureItem({
  title,
  description,
  theme,
}: {
  title: string;
  description: string;
  theme: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 20,
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.tint,
          marginTop: 6,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: theme.icon, lineHeight: 20 }}>
          {description}
        </Text>
      </View>
    </View>
  );
}