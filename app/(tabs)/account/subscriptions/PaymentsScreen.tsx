import AddPaymentModal from "@/components/account/subscriptions/AddPaymentModal";
import PaymentMethod from "@/components/account/subscriptions/PaymentMethod";
import { Colors } from "@/constants/Colors";
import { PaymentScreenProps } from "@/types/subscriptions";
import { useRouter } from 'expo-router';
import { ArrowLeft, Info, Plus } from "lucide-react-native";
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function PaymentsScreen({
    paymentMethods,
    modalVisible,
    setModalVisible,
    handleAddPaymentMethod,
    handleSetDefault,
    handleRemove,
}: PaymentScreenProps) {
    const colorScheme = useColorScheme() ?? "dark";
    const theme = Colors[colorScheme];
    const router = useRouter();

    return (
        <View style={{
            flex: 1,
            backgroundColor: theme.background,
            marginTop: 32
        }}>
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            padding: 8,
                            marginLeft: -8,
                            marginRight: 8,
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <ArrowLeft size={24} color={theme.tint} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: theme.text,
                    }}>
                        Payment Options
                    </Text>
                </View>

                {/* Info Banner */}
                <View style={{
                    backgroundColor: colorScheme === "dark"
                        ? "rgba(66, 153, 225, 0.08)"
                        : "rgba(66, 153, 225, 0.06)",
                    borderWidth: 1,
                    borderColor: colorScheme === "dark"
                        ? "rgba(66, 153, 225, 0.2)"
                        : "rgba(66, 153, 225, 0.15)",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    marginBottom: 24,
                }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                        <View style={{ marginTop: 1 }}>
                            <Info size={18} color={theme.tint} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                color: theme.text,
                                fontSize: 13,
                                fontWeight: "500",
                                lineHeight: 19,
                                opacity: 0.9,
                            }}>
                                Payment method changes will apply to your next billing cycle (11/4/2025)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section Header */}
                <Text style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.icon,
                    marginBottom: 14,
                    letterSpacing: -0.2,
                    textTransform: "uppercase",
                    opacity: 0.8,
                }}>
                    Payment Methods
                </Text>

                {/* Payment Methods List */}
                <View style={{ gap: 12, marginBottom: 16 }}>
                    {paymentMethods.map((method) => (
                        <PaymentMethod
                            key={method.id}
                            method={method}
                            onSetDefault={() => handleSetDefault(method.id)}
                            onRemove={() => handleRemove(method.id)}
                        />
                    ))}
                </View>

                {/* Add Payment Method Button */}
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={{
                        borderWidth: 2,
                        borderRadius: 16,
                        padding: 20,
                        backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                        borderColor: theme.tint,
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 12,
                    }}
                >
                    <Plus size={24} color={theme.tint} />
                    <Text style={{
                        color: theme.tint,
                        fontSize: 16,
                        fontWeight: '700',
                    }}>
                        Add Payment Method
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <AddPaymentModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdd={handleAddPaymentMethod}
            />
        </View>
    );
}