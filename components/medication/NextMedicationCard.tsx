import { Colors } from "@/constants/Colors";
import { NextMedication } from "@/types/medication";
import { Bell, Clock } from "lucide-react-native";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface NextMedicationCardProps {
  nextMedication: NextMedication;
}

export default function NextMedicationCard({ nextMedication }: NextMedicationCardProps) {
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
    <View style={{ padding: 20 }}>
      <View
        style={{
          backgroundColor: theme.cardBackground,
          borderRadius: 20,
          padding: 20,
          borderWidth: 2,
          borderColor: nextMedication.medication.color,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: nextMedication.medication.color + "20",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Clock size={20} color={nextMedication.medication.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                color: theme.icon,
                fontWeight: "600",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Next Medication
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: theme.icon,
                marginTop: 2,
              }}
            >
              {nextMedication.timeUntil}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: theme.border,
            marginVertical: 16,
          }}
        />

        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            {nextMedication.medication.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: nextMedication.medication.color,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            {nextMedication.medication.dosage}
          </Text>
          {nextMedication.medication.instructions && (
            <Text
              style={{
                fontSize: 14,
                color: theme.icon,
                marginTop: 8,
              }}
            >
              {nextMedication.medication.instructions}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 12,
              backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Bell size={16} color={nextMedication.medication.color} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: nextMedication.medication.color,
                marginLeft: 8,
              }}
            >
              {formatTime(nextMedication.alarm.time)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}