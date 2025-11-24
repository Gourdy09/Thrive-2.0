import AlarmItem from "@/components/medication/AlarmItem";
import { Colors } from "@/constants/Colors";
import { MedicationAlarm } from "@/types/medication";
import { Plus } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface RemindersListProps {
  alarms: MedicationAlarm[];
  onAddAlarm: () => void;
  onUpdateAlarm: (id: string, alarm: MedicationAlarm) => void;
  onRemoveAlarm: (id: string) => void;
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
        <AlarmItem
          key={alarm.id}
          alarm={alarm}
          onUpdate={(updatedAlarm) => onUpdateAlarm(alarm.id, updatedAlarm)}
          onRemove={() => onRemoveAlarm(alarm.id)}
        />
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