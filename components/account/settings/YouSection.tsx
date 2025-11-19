import { Colors } from "@/constants/Colors";
import React from 'react';
import { Text, TextInput, useColorScheme, View } from 'react-native';
import OptionButton from "./OptionButton";

interface YouSectionProps {
    onBirthdateChange: (date: string) => void;
    gender: "Male" | "Female";
    onGenderChange: (gender: "Male" | "Female") => void;
    onRaceChange: (race: string) => void;
    onBaselineGlucoseChange: (baselineGlucose: number) => void;
    onWeightChange: (weight: number) => void;
    onDietaryRestrictionChange: (dietaryRestrictions: string[]) => void;
}

export default function YouSection({
    onBirthdateChange,
    gender,
    onGenderChange,
    onRaceChange,
    onBaselineGlucoseChange,
    onWeightChange,
    onDietaryRestrictionChange
}: YouSectionProps) {
    const colorScheme = useColorScheme() ?? "dark";
    const theme = Colors[colorScheme];

    return (
        <>
            <Text
                style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.icon,
                    marginBottom: 14,
                    letterSpacing: -0.2,
                    textTransform: "uppercase",
                    opacity: 0.8,
                }}
            >
                You
            </Text>

            <View
                style={{
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    borderWidth: 2,
                    borderRadius: 16,
                    marginBottom: 24,
                    padding: 16,
                }}
            >
                {/* Gender */}
                <View>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: theme.text,
                            marginBottom: 12,
                        }}
                    >
                        Gender
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <OptionButton
                            label="Male"
                            selected={gender === "Male"}
                            onPress={() => onGenderChange("Male")}
                        />
                        <OptionButton
                            label="Female"
                            selected={gender === "Female"}
                            onPress={() => onGenderChange("Female")}
                        />
                    </View>
                </View>

                {/* Baseline Blood Glucose */}
                <View>
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: theme.text,
                            marginBottom: 12,
                        }}
                    >
                        Baseline Blood Glucose
                    </Text>
                    <TextInput
                        style={{
                            backgroundColor:
                                colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                            borderWidth: 2,
                            borderRadius: 12,
                            padding: 16,
                            color: theme.text,
                            fontSize: 16,
                            borderColor: theme.border,
                            
                        }}
                        placeholder="180"
                        placeholderTextColor={theme.icon}
                    />
                </View>
            </View>
        </>
    );
}