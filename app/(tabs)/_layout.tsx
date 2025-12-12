import { Colors } from "@/constants/Colors";
import { Tabs } from "expo-router";
import {
  CircleUser,
  Hamburger,
  LayoutDashboard,
  Pill,
} from "lucide-react-native";
import { useColorScheme } from "react-native";

export default function TabsLayout() {
  const scheme = useColorScheme() ?? "dark";
  const theme = Colors[scheme];

  return (
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
      }}
    >
      <Tabs.Screen
        name="food"
        options={{ tabBarIcon: ({ color }) => <Hamburger color={color} /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} />,
        }}
      />
      <Tabs.Screen
        name="medication"
        options={{ tabBarIcon: ({ color }) => <Pill color={color} /> }}
      />
      <Tabs.Screen
        name="account"
        options={{ tabBarIcon: ({ color }) => <CircleUser color={color} /> }}
      />
    </Tabs>
  );
}
