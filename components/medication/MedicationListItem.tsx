import { Colors } from "@/constants/Colors";
import { Medication } from "@/types/medication";
import { Bell, BellOff, ChevronRight } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface MedicationListItemProps {
  medication: Medication;
  onPress: () => void;
}

export default function MedicationListItem({ medication, onPress }: MedicationListItemProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: theme.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderLeftWidth: 6,
        borderColor: theme.border,
        borderLeftColor: medication.color,
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
              fontSize: 18,
              fontWeight: "700",
              color: theme.text,
              marginBottom: 4,
            }}
          >
            {medication.name}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: medication.color,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            {medication.dosage}
          </Text>
          {medication.alarms.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {medication.alarms.map((alarm) => (
                <View
                  key={alarm.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: alarm.enabled
                      ? medication.color + "20"
                      : colorScheme === "dark"
                      ? "#1c1e22"
                      : "#f8f9fa",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                  }}
                >
                  {alarm.enabled ? (
                    <Bell size={12} color={medication.color} />
                  ) : (
                    <BellOff size={12} color={theme.icon} />
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      color: alarm.enabled ? medication.color : theme.icon,
                      fontWeight: "600",
                      marginLeft: 4,
                    }}
                  >
                    {formatTime(alarm.time)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <ChevronRight size={20} color={theme.icon} />
      </View>
    </TouchableOpacity>
  );
}