import { Colors } from "@/constants/Colors";
import { CGMDevice } from "@/types/settings";
import { Check, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface RenameDeviceModalProps {
  visible: boolean;
  device: CGMDevice | null;
  onClose: () => void;
  onSave: (deviceId: string, newName: string) => void;
  onSetActive: (deviceId: string) => void;
  onRemove: (deviceId: string) => void;
}

export default function RenameDeviceModal({
  visible,
  device,
  onClose,
  onSave,
  onSetActive,
  onRemove,
}: RenameDeviceModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [name, setName] = useState("");

  useEffect(() => {
    if (device) {
      setName(device.name);
    }
  }, [device]);

  const handleSave = () => {
    if (device && name.trim()) {
      onSave(device.id, name.trim());
    }
  };

  const handleSetActive = () => {
    if (device) {
      onSetActive(device.id);
      onClose();
    }
  };

  const handleRemove = () => {
    if (device) {
      onRemove(device.id);
      onClose();
    }
  };

  if (!device) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: theme.text }}>
              Device Settings
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Device Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.icon,
                marginBottom: 8,
              }}
            >
              Device Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter device name"
              placeholderTextColor={theme.icon}
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

          {/* Device Info */}
          <View
            style={{
              backgroundColor:
                colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <InfoRow label="Type" value={device.type} />
            <InfoRow label="Serial Number" value={device.serialNumber} />
            <InfoRow label="Battery" value={`${device.batteryLevel}%`} />
            <InfoRow
              label="Status"
              value={device.isConnected ? "Connected" : "Disconnected"}
              isLast
            />
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 12 }}>
            {/* Save Name Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim() || name === device.name}
              style={{
                backgroundColor:
                  !name.trim() || name === device.name
                    ? theme.border
                    : theme.tint,
                padding: 16,
                borderRadius: 12,
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
                Save Name
              </Text>
            </TouchableOpacity>

            {/* Set as Active Button */}
            {!device.isActive && (
              <TouchableOpacity
                onPress={handleSetActive}
                style={{
                  borderWidth: 2,
                  borderColor: theme.tint,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Check size={20} color={theme.tint} />
                <Text
                  style={{
                    color: theme.tint,
                    fontWeight: "700",
                    fontSize: 16,
                  }}
                >
                  Set as Active Device
                </Text>
              </TouchableOpacity>
            )}

            {/* Remove Button */}
            <TouchableOpacity
              onPress={handleRemove}
              style={{
                borderWidth: 2,
                borderColor: "#ef4444",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#ef4444",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Remove Device
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.icon, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}