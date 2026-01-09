// components/food/RecipeCardSkeleton.tsx
import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, useColorScheme, View } from "react-native";

export function RecipeCardSkeleton() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 12,
        marginRight: 16,
        width: 280,
        overflow: "hidden",
      }}
    >
      {/* Image Skeleton */}
      <Animated.View
        style={{
          width: "100%",
          height: 160,
          backgroundColor: theme.border,
          opacity,
        }}
      />

      {/* Content Skeleton */}
      <View style={{ padding: 12 }}>
        {/* Title */}
        <Animated.View
          style={{
            height: 20,
            backgroundColor: theme.border,
            borderRadius: 4,
            marginBottom: 8,
            width: "80%",
            opacity,
          }}
        />

        {/* Tags */}
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <Animated.View
            style={{
              height: 24,
              width: 80,
              backgroundColor: theme.border,
              borderRadius: 12,
              opacity,
            }}
          />
          <Animated.View
            style={{
              height: 24,
              width: 60,
              backgroundColor: theme.border,
              borderRadius: 12,
              opacity,
            }}
          />
        </View>

        {/* Button */}
        <Animated.View
          style={{
            height: 40,
            backgroundColor: theme.border,
            borderRadius: 8,
            opacity,
          }}
        />
      </View>
    </View>
  );
}

export function RecipeSkeletonGrid() {
  return (
    <View style={{ flexDirection: "row", paddingLeft: 10 }}>
      <RecipeCardSkeleton />
      <RecipeCardSkeleton />
      <RecipeCardSkeleton />
    </View>
  );
}