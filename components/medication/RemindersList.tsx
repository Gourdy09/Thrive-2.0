import { Colors } from "@/constants/Colors";
import { MedicationAlarm } from "@/types/medication";
import { Plus, Trash2 } from "lucide-react-native";
import React from "react";
import { Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

interface RemindersListProps {
  alarms: MedicationAlarm[];
  onAddAlarm: () => void;
  onUpdateAlarm: (id: string, time: string) => void;
  onRemoveAlarm: (id: string) => void;
}

function formatTime(input: string) {

  let cleaned = input.replace(/[^0-9]/g, "");

  if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

  if (cleaned.length >= 3) {
    return cleaned.slice(0, 2) + ":" + cleaned.slice(2);
  }

  return cleaned;
}

export default function RemindersList({
  alarms,
  onAddAlarm,
  onUpdateAlarm,
  onRemoveAlarm,
}: RemindersListProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
          }}
        >
          Reminders
        </Text>
        <TouchableOpacity
          onPress={onAddAlarm}
          style={{
            backgroundColor: theme.tint,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Plus size={16} color={theme.background} />
          <Text
            style={{
              color: theme.background,
              fontWeight: "600",
              marginLeft: 4,
            }}
          >
            Add Time
          </Text>
        </TouchableOpacity>
      </View>

      {alarms.map((alarm) => (
        <View
          key={alarm.id}
          style={{
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
            borderRadius: 12,
            padding: 16,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 2,
            borderColor: theme.border,
          }}
        >
          <TextInput
            value={alarm.time}
            onChangeText={(text) => onUpdateAlarm(alarm.id, text)}
            placeholder="HH:MM"
            placeholderTextColor={theme.icon}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={{
              flex: 1,
              color: theme.text,
              fontSize: 18,
              fontWeight: "600",
            }}
          />

          <TouchableOpacity
            onPress={() => onRemoveAlarm(alarm.id)}
            style={{ padding: 8 }}
          >
            <Trash2 size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      ))}

      {alarms.length === 0 && (
        <Text
          style={{
            fontSize: 14,
            color: theme.icon,
            textAlign: "center",
            padding: 20,
          }}
        >
          No reminders set. Tap "Add Time" to create a reminder.
        </Text>
      )}
    </View>
  );
}