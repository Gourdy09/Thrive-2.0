import { Colors } from "@/constants/Colors";
import { BluetoothDevice } from "@/types/settings";
import { Bluetooth, X } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface AddDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  isScanning: boolean;
  discoveredDevices: BluetoothDevice[];
  onStartScan: () => void;
  onConnect: (device: BluetoothDevice) => void;
}

export default function AddDeviceModal({
  visible,
  onClose,
  isScanning,
  discoveredDevices,
  onStartScan,
  onConnect,
}: AddDeviceModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return "Excellent";
    if (rssi > -60) return "Good";
    if (rssi > -70) return "Fair";
    return "Weak";
  };

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
            maxHeight: "85%",
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
              Add Device
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <Text
            style={{
              fontSize: 14,
              color: theme.icon,
              marginBottom: 20,
              lineHeight: 20,
            }}
          >
            Make sure your CGM sensor is in pairing mode and nearby.
          </Text>

          {/* Scan Button */}
          {!isScanning && discoveredDevices.length === 0 && (
            <TouchableOpacity
              onPress={onStartScan}
              style={{
                backgroundColor: theme.tint,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <Bluetooth size={20} color={theme.background} />
              <Text
                style={{
                  color: theme.background,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Start Scanning
              </Text>
            </TouchableOpacity>
          )}

          {/* Scanning Indicator */}
          {isScanning && (
            <View
              style={{
                padding: 24,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ActivityIndicator size="large" color={theme.tint} />
              <Text
                style={{
                  color: theme.text,
                  marginTop: 16,
                  fontSize: 16,
                }}
              >
                Scanning for devices...
              </Text>
            </View>
          )}

          {/* Discovered Devices */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {discoveredDevices.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.icon,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: -0.2,
                  }}
                >
                  Found Devices
                </Text>
                <View style={{ gap: 12 }}>
                  {discoveredDevices.map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      onPress={() => onConnect(device)}
                      style={{
                        borderWidth: 2,
                        borderColor: theme.border,
                        borderRadius: 12,
                        padding: 16,
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: theme.text,
                              marginBottom: 4,
                            }}
                          >
                            {device.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color: theme.icon,
                            }}
                          >
                            Signal: {getSignalStrength(device.rssi)}
                          </Text>
                        </View>
                        <Bluetooth size={24} color={theme.tint} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Rescan Button */}
          {!isScanning && discoveredDevices.length > 0 && (
            <TouchableOpacity
              onPress={onStartScan}
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: theme.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontWeight: "600",
                }}
              >
                Scan Again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}