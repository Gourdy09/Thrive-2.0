import { Colors } from "@/constants/Colors";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface AccountSectionProps {
  email: string;
  onChangeEmail: () => void;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}

export default function AccountSection({
  email,
  onChangeEmail,
  onChangePassword,
  onDeleteAccount,
}: AccountSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <>
      <Text
        style={{
          fontSize: 15,
          fontWeight: "600",
          color: theme.icon,
          marginBottom: 14,
          letterSpacing: -0.2,
          textTransform: "uppercase",
          opacity: 0.8,
        }}
      >
        Account
      </Text>

      <View style={{ marginBottom: 24 }}>
        <SettingItem
          label="Change Email"
          value={email}
          onPress={onChangeEmail}
        />
        <SettingItem
          label="Change Password"
          value="••••••••"
          onPress={onChangePassword}
        />
        <SettingItem
          label="Delete Account"
          onPress={onDeleteAccount}
          danger
        />
      </View>
    </>
  );
}

function SettingItem({
  label,
  value,
  onPress,
  danger = false,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colorScheme === "dark" ? "#2A2D2F" : "#E2E4E7",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: danger ? "#ef4444" : theme.text,
            fontWeight: danger ? "600" : "400",
          }}
        >
          {label}
        </Text>
        {value && (
          <Text
            style={{
              fontSize: 14,
              color: theme.icon,
              marginTop: 4,
            }}
          >
            {value}
          </Text>
        )}
      </View>
      <ChevronRight color={danger ? "#ef4444" : theme.icon} size={20} />
    </TouchableOpacity>
  );
}