import { Colors } from "@/constants/Colors";
import {
  LayoutDashboard
} from "lucide-react-native";
import React from 'react';
import { Text, View, useColorScheme } from "react-native";

interface DashboardReportProps {
    username: string
}

export default function DashboardHeader ({username}: DashboardReportProps) {
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    
  return (
    <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <LayoutDashboard color={theme.tint} size={32} />
        <Text
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: "600",
          }}
        >
          Hey, {username}
        </Text>
      </View>
  )
}