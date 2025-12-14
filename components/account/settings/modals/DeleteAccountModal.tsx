import { Colors } from "@/constants/Colors";
import { AlertTriangle } from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [confirmText, setConfirmText] = useState("");
  const requiredText = "DELETE";

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
            borderColor: "#ef4444",
          }}
        >
          {/* Warning Icon */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={32} color="#ef4444" />
            </View>
          </View>

          {/* Header */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: theme.text,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Delete Account
          </Text>

          {/* Warning Text */}
          <Text
            style={{
              fontSize: 14,
              color: theme.text,
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            This action cannot be undone. All your data, including glucose
            readings, device connections, and settings will be permanently
            deleted.
          </Text>

          {/* Confirmation Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 13,
                color: theme.icon,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Type <Text style={{ fontWeight: "700" }}>{requiredText}</Text> to
              confirm
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder={requiredText}
              placeholderTextColor={theme.icon}
              autoCapitalize="characters"
              style={{
                backgroundColor:
                  colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                fontSize: 16,
                textAlign: "center",
                fontWeight: "700",
              }}
            />
          </View>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={confirmText !== requiredText}
              style={{
                paddingVertical: 14,
                borderRadius: 10,
                backgroundColor:
                  confirmText === requiredText ? "#ef4444" : theme.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Delete My Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 14,
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
          </View>
        </View>
      </View>
    </Modal>
  );
}