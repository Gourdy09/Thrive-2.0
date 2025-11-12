import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Text, TextInput, useColorScheme, View } from 'react-native';

export default function BloodsugarNotification() {
  const [alertAbove, setAlertAbove] = useState(0);
  const [alertBelow, setAlertBelow] = useState(0);
  const [isAboveActive, setIsAboveActive] = useState(false);
  const [isBelowActive, setIsBelowActive] = useState(false);

  const units = "mg/dL"

  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  return (
    <View style={{
      flexDirection: 'column',
    }}>
      <View style={{
        flexDirection: 'row',
        alignContent: 'space-between'
      }}>
        <Text style={{
          color: theme.text
        }}>
          Alert Above:
        </Text>
        <TextInput style={{
          color: theme.text,
          borderBottomColor: isAboveActive ? theme.toggled : theme.border,
          borderBottomWidth: 2,
          backgroundColor: theme.background
        }}
          onFocus={() => setIsAboveActive(true)}
          onBlur={() => setIsAboveActive(false)}
          placeholder='000'
          placeholderTextColor={theme.icon}
        >
        </TextInput>
        <Text style={{ color: theme.text }}>
          {units}
        </Text>
      </View>
      <View style={{
        flexDirection: 'row',
        alignContent: 'space-between'
      }}>
        <Text style={{
          color: theme.text
        }}>
          Alert Below:
        </Text>
        <TextInput style={{
          color: theme.text,
          borderBottomColor: isAboveActive ? theme.toggled : theme.border,
          borderBottomWidth: 2,
          backgroundColor: theme.background
        }}
          onFocus={() => setIsAboveActive(true)}
          onBlur={() => setIsAboveActive(false)}
          placeholder='000'
          placeholderTextColor={theme.icon}
        >
        </TextInput>
        <Text style={{ color: theme.text }}>
          {units}
        </Text>
      </View>

    </View>
  )
}