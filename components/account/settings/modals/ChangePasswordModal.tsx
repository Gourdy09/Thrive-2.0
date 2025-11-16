import { Colors } from "@/constants/Colors";
import { Eye, EyeOff, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (currentPassword: string, newPassword: string) => void;
}

export default function ChangePasswordModal({
  visible,
  onClose,
  onSave,
}: ChangePasswordModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid =
    currentPassword.trim() &&
    newPassword.trim() &&
    newPassword === confirmPassword &&
    newPassword.length >= 8;

  const handleSave = () => {
    if (isValid) {
      onSave(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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
              Change Password
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Current Password */}
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
          />

          {/* New Password */}
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
          />

          {/* Confirm Password */}
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? "Passwords don't match"
                : undefined
            }
          />

          {/* Password Requirements */}
          {newPassword && newPassword.length < 8 && (
            <Text
              style={{
                fontSize: 12,
                color: "#ef4444",
                marginBottom: 16,
              }}
            >
              Password must be at least 8 characters
            </Text>
          )}

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
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
              disabled={!isValid}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: isValid ? theme.tint : theme.border,
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

function PasswordInput({
  label,
  value,
  onChangeText,
  show,
  onToggleShow,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  show: boolean;
  onToggleShow: () => void;
  error?: string;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: theme.icon,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View style={{ position: "relative" }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter password"
          placeholderTextColor={theme.icon}
          secureTextEntry={!show}
          autoCapitalize="none"
          style={{
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
            borderWidth: 2,
            borderColor: error ? "#ef4444" : theme.border,
            borderRadius: 12,
            padding: 16,
            paddingRight: 48,
            color: theme.text,
            fontSize: 16,
          }}
        />
        <TouchableOpacity
          onPress={onToggleShow}
          style={{
            position: "absolute",
            right: 16,
            top: 16,
          }}
        >
          {show ? (
            <EyeOff size={20} color={theme.icon} />
          ) : (
            <Eye size={20} color={theme.icon} />
          )}
        </TouchableOpacity>
      </View>
      {error && (
        <Text
          style={{
            fontSize: 12,
            color: "#ef4444",
            marginTop: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}