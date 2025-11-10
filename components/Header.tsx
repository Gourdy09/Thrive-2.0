import { Colors } from "@/constants/Colors";
import { icons } from 'lucide-react-native';
import React from 'react';
import { Text, View, useColorScheme } from "react-native";
import HeaderIcon from "./HeaderIcon";

interface HeaderProps {
    username: string
    icon: keyof typeof icons;
}

export default function Header ({username, icon}: HeaderProps) {
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
        <HeaderIcon iconName={icon} color={theme.tint} size={32}/>
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