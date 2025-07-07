import { Colors } from "@/constants/colors";
import { Tabs } from "expo-router";
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

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors[colorScheme].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].icon,
        },
        headerShown: false,
      }}
      initialRouteName="dashboard"
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
  );
}
