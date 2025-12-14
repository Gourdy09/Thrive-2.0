import DaySelector from "@/components/medication/DaySelector";
import TimeInput from "@/components/medication/TimeInput";
import { Colors } from "@/constants/Colors";
import { DayOfWeek, MedicationAlarm } from "@/types/medication";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

interface AlarmItemProps {
  alarm: MedicationAlarm;
  onUpdate: (alarm: MedicationAlarm) => void;
  onRemove: () => void;
}

export default function AlarmItem({ alarm, onUpdate, onRemove }: AlarmItemProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTimeChange = (time: string) => {
    onUpdate({ ...alarm, time });
  };

  const handleDaysChange = (days: DayOfWeek[]) => {
    onUpdate({ ...alarm, days });
  };

  const getDaysLabel = () => {
    if (alarm.days.length === 7) return "Every day";
    if (alarm.days.length === 5 && 
        alarm.days.includes('Mon') && 
        alarm.days.includes('Tue') && 
        alarm.days.includes('Wed') && 
        alarm.days.includes('Thu') && 
        alarm.days.includes('Fri')) {
      return "Weekdays";
    }
    if (alarm.days.length === 2 && 
        alarm.days.includes('Sat') && 
        alarm.days.includes('Sun')) {
      return "Weekends";
    }
    return alarm.days.join(', ');
  };

  return (
    <View
      style={{
        backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: theme.border,
      }}
    >
      {/* Header with Time and Controls */}
      <View style={{ marginBottom: isExpanded ? 16 : 0 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <TimeInput value={alarm.time} onChange={handleTimeChange} />
          
          <TouchableOpacity onPress={onRemove} style={{ padding: 8 }}>
            <Trash2 size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        {/* Days Label - Clickable to expand */}
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.icon,
              flex: 1,
            }}
          >
            {getDaysLabel()}
          </Text>
          {isExpanded ? (
            <ChevronUp size={16} color={theme.icon} />
          ) : (
            <ChevronDown size={16} color={theme.icon} />
          )}
        </TouchableOpacity>
      </View>

      {/* Expanded Day Selector */}
      {isExpanded && (
        <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
          <DaySelector selectedDays={alarm.days} onChange={handleDaysChange} />
        </View>
      )}
    </View>
  );
}