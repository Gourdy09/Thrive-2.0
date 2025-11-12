import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Switch, Text, useColorScheme, View } from 'react-native';

interface NotifcationToggleProps {
    name: string;
    toggled: boolean;
}

export default function NotificationToggle({ name, toggled }: NotifcationToggleProps) {
    const colorScheme = useColorScheme() ?? "dark";
    const theme = Colors[colorScheme];
    const [isEnabled, setIsEnabled] = useState(true);

    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={{
            flexDirection: "row",
            backgroundColor: theme.cardBackground,
            paddingVertical: 14,
            paddingHorizontal: 24,
            justifyContent: 'space-between',
            borderRadius: 16,
        }}>
            <Text style={{
                color: theme.text
            }}>
                {name}
            </Text>
            <Switch
                trackColor={{ false: theme.shadow, true: theme.toggled }}
                thumbColor={"#d4d4d8"}
                onValueChange={toggleSwitch}
                value={isEnabled}
            />
        </View>
    )
}