import { Colors } from "@/constants/colors";
import { Tabs } from "expo-router";
import { View } from "react-native";

import {
  CircleUser,
  Hamburger,
  LayoutDashboard,
  Pill,
  SquareActivity,
} from "lucide-react-native";
import React from "react";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
    >
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.icon,
          },
          headerShown: false,
          // Add smooth transitions between tabs
          animation: "shift",
        }}
        initialRouteName="dashboard"
        backBehavior="history"
      >
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color }) => <Hamburger color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ color }) => <SquareActivity color={color} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} />,
          }}
        />
        <Tabs.Screen
          name="medication"
          options={{
            title: "Medication",
            tabBarIcon: ({ color }) => <Pill color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color }) => <CircleUser color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
