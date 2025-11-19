import { Colors } from "@/constants/Colors";
import { X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface ChangeEmailModalProps {
  visible: boolean;
  currentEmail: string;
  onClose: () => void;
  onSave: (email: string) => void;
}

export default function ChangeEmailModal({
  visible,
  currentEmail,
  onClose,
  onSave,
}: ChangeEmailModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [email, setEmail] = useState(currentEmail);

  const handleSave = () => {
    if (email.trim() && email !== currentEmail) {
      onSave(email.trim());
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: "85%",
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            borderWidth: 2,
            borderColor: theme.border,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text }}>
              Change Email
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Current Email */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 13,
                color: theme.icon,
                marginBottom: 4,
              }}
            >
              Current Email
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.text,
                fontWeight: "500",
              }}
            >
              {currentEmail}
            </Text>
          </View>

          {/* New Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.icon,
                marginBottom: 8,
              }}
            >
              New Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter new email"
              placeholderTextColor={theme.icon}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                fontSize: 16,
              }}
            />
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!email.trim() || email === currentEmail}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor:
                  !email.trim() || email === currentEmail
                    ? theme.border
                    : theme.tint,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: "700",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}