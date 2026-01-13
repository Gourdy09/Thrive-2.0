import { Colors } from "@/constants/Colors";
import { Building2, Check, CreditCard } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

export interface PaymentMethodData {
  id: string;
  type: "card" | "bank";
  lastFour: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;

}

export interface PaymentMethodProps {
  method: PaymentMethodData;
  onSetDefault: () => void;
  onRemove: () => void;
}

export default function PaymentMethod({
  method,
  onSetDefault,
  onRemove,
}: PaymentMethodProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        borderWidth: 2,
        borderRadius: 16,
        padding: 20,
        backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
        borderColor: method.isDefault ? theme.tint : theme.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {method.type === "card" ? (
            <CreditCard color={theme.tint} size={32} />
          ) : (
            <Building2 color={theme.tint} size={32} />
          )}
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {method.type === "card" ? method.brand : method.bankName}
            </Text>
            <Text style={{ color: theme.icon, fontSize: 14 }}>
              •••• •••• •••• {method.lastFour}
            </Text>
          </View>
        </View>

        {method.isDefault && (
          <View
            style={{
              backgroundColor: theme.tint,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Check size={14} color={theme.background} />
            <Text
              style={{
                color: theme.background,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              Default
            </Text>
          </View>
        )}
      </View>

      {!method.isDefault && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={onSetDefault}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: theme.border,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              Set as Default
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#ef4444",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#ef4444", fontWeight: "600" }}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
