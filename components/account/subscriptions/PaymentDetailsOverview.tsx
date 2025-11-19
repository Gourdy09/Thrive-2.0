import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronRight, CreditCardIcon } from "lucide-react-native";
import React from 'react';
import {
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";

export default function PaymentDetailsOverview() {
    const colorScheme = useColorScheme() ?? "dark";
    const theme = Colors[colorScheme];
    const router = useRouter();

    function openPaymentOptions(){
        router.push("/(tabs)/account/subscriptions/PaymentContainer");
    }

    return (
        <TouchableOpacity activeOpacity={0.5}
        onPress={() => openPaymentOptions()}>
            <View style={{
                borderColor: theme.tint,
                borderWidth: 2,
                borderRadius: 16,
                padding: 20,
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <View style={{
                    flexDirection: "column",
                    gap: 16,
                }}>
                    <View style={{
                        flexDirection: "row",
                        gap: 16,
                        alignItems: "center",
                    }}>
                        <CreditCardIcon color={theme.tint} size={44} />
                        <Text style={{
                            color: theme.text,
                            fontSize: 16,
                            fontWeight: 800,
                        }}>
                            •••• •••• •••• 4167
                        </Text>
                    </View>
                    <Text style={{
                        color: theme.text
                    }}>
                        Next charge on 11/4/2025
                    </Text>
                </View>
                <ChevronRight color={theme.icon} size={40} />
            </View>
        </TouchableOpacity>
    )
}