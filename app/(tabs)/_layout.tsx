import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import {
  CircleUser,
  Hamburger,
  LayoutDashboard,
  Pill,
} from "lucide-react-native";
import React from "react";
import { View, useColorScheme } from "react-native";

export default function Layout() {
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
        initialRouteName="dashboard"
        screenOptions={{
          tabBarShowLabel: false,
          lazy: false,
          tabBarActiveTintColor: theme.tabIconSelected,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.icon,
            borderTopWidth: 1,
          },
          headerShown: false,
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color }) => <Hamburger color={color} />,
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
