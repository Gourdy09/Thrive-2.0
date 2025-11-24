import { Colors } from "@/constants/Colors";
import { formatTime12Hour, NextMedication } from "@/types/medication";
import { Bell, Calendar, Clock } from "lucide-react-native";
import React from "react";
import { Text, useColorScheme, View } from "react-native";

interface NextMedicationCardProps {
  nextMedication: NextMedication;
}

export default function NextMedicationCard({ nextMedication }: NextMedicationCardProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

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
          
          {/* Time and Day Display */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
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
                {formatTime12Hour(nextMedication.alarm.time)}
              </Text>
            </View>
            
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Calendar size={16} color={theme.icon} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.text,
                  marginLeft: 8,
                }}
              >
                {nextMedication.dayLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}