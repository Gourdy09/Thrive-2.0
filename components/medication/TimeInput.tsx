import { Colors } from "@/constants/Colors";
import { convert12to24, convert24to12 } from "@/types/medication";
import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

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
  const [currentPeriod, setCurrentPeriod] = useState<"AM" | "PM">(period);

  useEffect(() => {
    const { hour, minute, period } = convert24to12(value);
    setHourInput(hour);
    setMinuteInput(minute);
    setCurrentPeriod(period);
  }, [value]);

  // Updates the parent without formatting; only if valid numbers
  const tryUpdateTime = (h: string, m: string, p: "AM" | "PM") => {
    const hourNum = parseInt(h);
    const minuteNum = parseInt(m);

    if (
      !isNaN(hourNum) &&
      hourNum >= 1 &&
      hourNum <= 12 &&
      !isNaN(minuteNum) &&
      minuteNum >= 0 &&
      minuteNum <= 59
    ) {
      const time24 = convert12to24(h.padStart(2, "0"), m.padStart(2, "0"), p);
      onChange(time24);
    }
  };

  const handleHourChange = (text: string) => {
    // Only allow 0-9
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length > 2) return;
    setHourInput(cleaned);

    if (cleaned !== "") tryUpdateTime(cleaned, minuteInput, currentPeriod);
  };

  const handleMinuteChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length > 2) return; // max 2 digits
    setMinuteInput(cleaned);

    if (cleaned !== "") tryUpdateTime(hourInput, cleaned, currentPeriod);
  };

  const handlePeriodToggle = () => {
    const newPeriod = currentPeriod === "AM" ? "PM" : "AM";
    setCurrentPeriod(newPeriod);
    tryUpdateTime(hourInput, minuteInput, newPeriod);
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

      <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700" }}>
        :
      </Text>

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
