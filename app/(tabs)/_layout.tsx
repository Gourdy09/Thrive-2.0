import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import {
  CircleUser,
  Hamburger,
  LayoutDashboard,
  Pill,
  SquareActivity,
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
        initialRouteName="dashboard/index"
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
          name="dashboard/index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <LayoutDashboard color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity/index"
          options={{
            title: "Activity",
            tabBarIcon: ({ color }) => <SquareActivity color={color} />,
          }}
        />
        <Tabs.Screen
          name="food/index"
          options={{
            title: "Food",
            tabBarIcon: ({ color }) => <Hamburger color={color} />,
          }}
        />
        <Tabs.Screen
          name="medication/index"
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
