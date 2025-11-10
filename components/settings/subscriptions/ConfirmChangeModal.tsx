import { Colors } from "@/constants/Colors";
import React from "react";
import { Modal, Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface ConfirmChangeModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmChangeModal({ visible, onConfirm, onCancel }: ConfirmChangeModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

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
            width: "80%",
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            borderColor: theme.border,
            borderWidth: 2
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 8 }}>
            Are you sure you want to change your plan?
          </Text>
          <Text style={{ fontSize: 14, color: theme.icon, marginBottom: 24 }}>
            New plan starts on 11/4/2025
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
            <TouchableOpacity onPress={onCancel} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9, borderColor: theme.border, borderWidth: 2 }}>
              <Text style={{ color: theme.icon }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9, backgroundColor: theme.tint }}>
              <Text style={{ color: theme.background, fontWeight: "700" }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
