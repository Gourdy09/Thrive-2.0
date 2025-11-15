import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Text, TextInput, useColorScheme, View } from 'react-native';

export default function BloodsugarNotification() {
  const [alertAbove, setAlertAbove] = useState('');
  const [alertBelow, setAlertBelow] = useState('');
  const [isAboveActive, setIsAboveActive] = useState(false);
  const [isBelowActive, setIsBelowActive] = useState(false);

  const units = "mg/dL";
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View
      style={{
        flexDirection: 'column',
        borderRadius: 16,
        backgroundColor: theme.cardBackground,
        overflow: 'hidden',
      }}
    >
      {/* Alert Above */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: theme.border,
        borderBottomWidth: 1.5,
      }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
          Alert Above:
        </Text>
        <TextInput
          value={alertAbove}
          onChangeText={(text) => setAlertAbove(text.replace(/[^0-9]/g, ''))} // only digits
          onFocus={() => setIsAboveActive(true)}
          onBlur={() => setIsAboveActive(false)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="000"
          placeholderTextColor={theme.icon}
          style={{
            color: theme.text,
            fontSize: 16,
            textAlign: 'center',
            borderBottomWidth: 2,
            borderBottomColor: isAboveActive ? theme.tint : theme.border,
            backgroundColor: theme.background,
            width: 70,
            marginRight: 8,
            borderRadius: 8,
            paddingVertical: 4,
          }}
        />
        <Text style={{ color: theme.text, fontSize: 15 }}>{units}</Text>
      </View>

      {/* Alert Below */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomColor: theme.border,
        borderBottomWidth: 1.5,
      }}>
        <Text style={{ color: theme.text, fontSize: 16, flex: 1 }}>
          Alert Below:
        </Text>
        <TextInput
          value={alertBelow}
          onChangeText={(text) => setAlertBelow(text.replace(/[^0-9]/g, ''))} // only digits
          onFocus={() => setIsBelowActive(true)}
          onBlur={() => setIsBelowActive(false)}
          keyboardType="numeric"
          maxLength={3}
          placeholder="000"
          placeholderTextColor={theme.icon}
          style={{
            color: theme.text,
            fontSize: 16,
            textAlign: 'center',
            borderBottomWidth: 2,
            borderBottomColor: isBelowActive ? theme.tint : theme.border,
            backgroundColor: theme.background,
            width: 70,
            marginRight: 8,
            borderRadius: 8,
            paddingVertical: 4,
          }}
        />
        <Text style={{ color: theme.text, fontSize: 15 }}>{units}</Text>
      </View>
    </View>
  );
}
