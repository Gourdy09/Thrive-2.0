import { Colors } from "@/constants/Colors";
import { PlanDescription } from "@/types/subscriptions";
import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

interface PaymentOptionProps {
  planName: string;
  description: PlanDescription[];
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  price: number;
}

export default function PaymentOption ({ planName, description, selected = false, disabled = false, onSelect, price = 0.00 }: PaymentOptionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      style={{
        borderWidth: 2,
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
        borderColor: selected
          ? theme.tint
          : disabled
            ? theme.icon
            : colorScheme === "dark"
              ? "#2a2d31"
              : "#e0e0e0",
        opacity: disabled ? 0.5 : 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingStart: 24,
        paddingEnd: 24
      }}
    >

      {/* Plan Name and Description */}
      <View style={{ flexDirection: "column" }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: disabled ? theme.icon : theme.text,
            marginBottom: 8,
          }}
        >
          {planName} {disabled ? "(Current)" : ""}
        </Text>

        {description.map((item) => (
          <View key={item.id} style={{ flexDirection: "row", marginBottom: 4 }}>
            <Text style={{ color: disabled ? theme.icon : theme.icon, marginRight: 6 }}>
              {"\u2022"}
            </Text>
            <Text style={{ color: disabled ? theme.icon : theme.icon, flexShrink: 1 }}>
              {item.text}
            </Text>
          </View>
        ))}
      </View>


      {price == 0 ?
        <Text style={{ fontSize: 24, color: theme.tint, fontWeight: 800 }}>
          Free
        </Text>
        :
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Text style={{ fontSize: 24, color: theme.tint, fontWeight: 800 }}>
            ${price.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 16, color: theme.icon }}>
            Monthly
          </Text>
        </View>
      }


    </TouchableOpacity>
  );
};