import { Colors } from "@/constants/Colors";
import { CGMDevice } from "@/types/settings";
import { Battery, Check, CircleDot, Plus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface DevicesSectionProps {
  devices: CGMDevice[];
  onAddDevice: () => void;
  onDevicePress: (device: CGMDevice) => void;
}

export default function DevicesSection({
  devices,
  onAddDevice,
  onDevicePress,
}: DevicesSectionProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

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
        Devices
      </Text>

      <View style={{ gap: 12, marginBottom: 16 }}>
        {devices.map((device) => (
          <TouchableOpacity
            key={device.id}
            onPress={() => onDevicePress(device)}
            style={{
              borderWidth: 2,
              borderRadius: 16,
              padding: 16,
              backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
              borderColor: device.isActive ? theme.tint : theme.border,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: theme.text,
                    }}
                  >
                    {device.name}
                  </Text>
                  {device.isActive && (
                    <View
                      style={{
                        backgroundColor: theme.tint,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 6,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={12} color={theme.background} />
                      <Text
                        style={{
                          color: theme.background,
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        Active
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={{ fontSize: 13, color: theme.icon, marginBottom: 8 }}>
                  {device.serialNumber}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CircleDot
                      size={14}
                      color={device.isConnected ? "#10b981" : "#ef4444"}
                      fill={device.isConnected ? "#10b981" : "#ef4444"}
                    />
                    <Text style={{ fontSize: 12, color: theme.icon }}>
                      {device.isConnected ? "Connected" : "Disconnected"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Battery size={14} color={theme.icon} />
                    <Text style={{ fontSize: 12, color: theme.icon }}>
                      {device.batteryLevel}%
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 12, color: theme.icon, marginTop: 4 }}>
                  Last sync: {formatLastSync(device.lastSync)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Device Button */}
      <TouchableOpacity
        onPress={onAddDevice}
        style={{
          borderWidth: 2,
          borderRadius: 16,
          padding: 20,
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderColor: theme.tint,
          borderStyle: "dashed",
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Plus size={24} color={theme.tint} />
        <Text
          style={{
            color: theme.tint,
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          Add Device
        </Text>
      </TouchableOpacity>
    </>
  );
}