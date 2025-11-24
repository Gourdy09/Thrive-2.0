import { Colors } from "@/constants/Colors";
import { convert12to24, convert24to12 } from "@/types/medication";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

interface TimeInputProps {
  value: string; // 24-hour format "HH:MM"
  onChange: (time24: string) => void;
}

export default function TimeInput({ value, onChange }: TimeInputProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  
  const { hour, minute, period } = convert24to12(value);
  const [hourInput, setHourInput] = useState(hour);
  const [minuteInput, setMinuteInput] = useState(minute);
  const [currentPeriod, setCurrentPeriod] = useState<'AM' | 'PM'>(period);

  const updateTime = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    const time24 = convert12to24(newHour, newMinute, newPeriod);
    onChange(time24);
  };

  const handleHourChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned === '') {
      setHourInput('');
      return;
    }
    
    let hourNum = parseInt(cleaned);
    
    // Limit to 12
    if (hourNum > 12) {
      hourNum = 12;
    }
    
    const formatted = hourNum.toString().padStart(2, '0');
    setHourInput(formatted);
    updateTime(formatted, minuteInput, currentPeriod);
  };

  const handleMinuteChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned === '') {
      setMinuteInput('');
      return;
    }
    
    let minuteNum = parseInt(cleaned);
    
    // Limit to 59
    if (minuteNum > 59) {
      minuteNum = 59;
    }
    
    const formatted = minuteNum.toString().padStart(2, '0');
    setMinuteInput(formatted);
    updateTime(hourInput, formatted, currentPeriod);
  };

  const handlePeriodToggle = () => {
    const newPeriod = currentPeriod === 'AM' ? 'PM' : 'AM';
    setCurrentPeriod(newPeriod);
    updateTime(hourInput, minuteInput, newPeriod);
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {/* Hour Input */}
      <TextInput
        value={hourInput}
        onChangeText={handleHourChange}
        placeholder="HH"
        placeholderTextColor={theme.icon}
        keyboardType="number-pad"
        maxLength={2}
        style={{
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderWidth: 2,
          borderColor: theme.border,
          borderRadius: 12,
          padding: 12,
          color: theme.text,
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
          width: 60,
        }}
      />

      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>:</Text>

      {/* Minute Input */}
      <TextInput
        value={minuteInput}
        onChangeText={handleMinuteChange}
        placeholder="MM"
        placeholderTextColor={theme.icon}
        keyboardType="number-pad"
        maxLength={2}
        style={{
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderWidth: 2,
          borderColor: theme.border,
          borderRadius: 12,
          padding: 12,
          color: theme.text,
          fontSize: 18,
          fontWeight: "600",
          textAlign: "center",
          width: 60,
        }}
      />

      {/* AM/PM Toggle */}
      <TouchableOpacity
        onPress={handlePeriodToggle}
        style={{
          backgroundColor: theme.tint,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          minWidth: 60,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.background,
            fontSize: 16,
            fontWeight: "700",
          }}
        >
          {currentPeriod}
        </Text>
      </TouchableOpacity>
    </View>
  );
}