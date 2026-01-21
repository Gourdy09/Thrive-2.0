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
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only sync from parent when not actively editing
    if (!isFocused) {
      const { hour, minute, period } = convert24to12(value);
      setHourInput(hour);
      setMinuteInput(minute);
      setCurrentPeriod(period);
    }
  }, [value, isFocused]);

  // Updates the parent without formatting; only if valid numbers
  const tryUpdateTime = (h: string, m: string, p: "AM" | "PM", shouldPad: boolean = false) => {
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
      const hourStr = shouldPad ? h.padStart(2, "0") : h;
      const minuteStr = shouldPad ? m.padStart(2, "0") : m;
      const time24 = convert12to24(hourStr, minuteStr, p);
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

  const handleHourBlur = () => {
    setIsFocused(false);
    if (hourInput !== "") {
      let hourNum = parseInt(hourInput);
      let newPeriod = currentPeriod;
      
      // Handle hours > 12 by converting to 12-hour format
      if (hourNum > 12) {
        // If currently AM and hour > 12, switch to PM
        if (currentPeriod === "AM") {
          newPeriod = "PM";
          hourNum = hourNum - 12;
        } else {
          // If already PM, wrap around (13 PM -> 1 PM, 24 PM -> 12 PM)
          hourNum = hourNum > 12 ? hourNum - 12 : hourNum;
        }
      } else if (hourNum === 0) {
        hourNum = 12;
      }
      
      const padded = hourNum.toString().padStart(2, "0");
      setHourInput(padded);
      setCurrentPeriod(newPeriod);
      tryUpdateTime(padded, minuteInput, newPeriod, true);
    }
  };

  const handleMinuteBlur = () => {
    setIsFocused(false);
    if (minuteInput !== "") {
      let minuteNum = parseInt(minuteInput);
      let hourNum = parseInt(hourInput) || 9;
      let newPeriod = currentPeriod;
      
      // Handle minutes >= 60 by rolling over to next hour
      if (minuteNum >= 60) {
        const additionalHours = Math.floor(minuteNum / 60);
        minuteNum = minuteNum % 60;
        hourNum += additionalHours;
        
        // Handle hour overflow
        while (hourNum > 12) {
          hourNum -= 12;
          newPeriod = newPeriod === "AM" ? "PM" : "AM";
        }
      }
      
      const paddedMinute = minuteNum.toString().padStart(2, "0");
      const paddedHour = hourNum.toString().padStart(2, "0");
      setMinuteInput(paddedMinute);
      setHourInput(paddedHour);
      setCurrentPeriod(newPeriod);
      tryUpdateTime(paddedHour, paddedMinute, newPeriod, true);
    }
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
        onFocus={() => setIsFocused(true)}
        onBlur={handleHourBlur}
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
        onFocus={() => setIsFocused(true)}
        onBlur={handleMinuteBlur}
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