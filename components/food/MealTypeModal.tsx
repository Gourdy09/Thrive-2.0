import { Colors } from "@/constants/Colors";
import { Coffee, Moon, Sunrise, Sunset, X } from "lucide-react-native";
import React from "react";
import {
    Modal,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

interface MealTypeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
  recipeName: string;
}

export default function MealTypeModal({
  visible,
  onClose,
  onSelect,
  recipeName,
}: MealTypeModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const mealTypes = [
    {
      id: "breakfast" as const,
      label: "Breakfast",
      icon: Sunrise,
      color: "#FF6B6B",
      time: "Morning",
    },
    {
      id: "lunch" as const,
      label: "Lunch",
      icon: Sunset,
      color: "#4ECDC4",
      time: "Afternoon",
    },
    {
      id: "dinner" as const,
      label: "Dinner",
      icon: Moon,
      color: "#95E1D3",
      time: "Evening",
    },
    {
      id: "snack" as const,
      label: "Snack",
      icon: Coffee,
      color: "#FFA07A",
      time: "Anytime",
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 24, fontWeight: "700", color: theme.text }}
              >
                Add to Food Log
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.icon,
                  marginTop: 4,
                }}
              >
                Select meal type
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: theme.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.text,
                fontWeight: "600",
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {recipeName}
            </Text>
            <Text style={{ fontSize: 14, color: theme.icon }}>
              Tap to add to your daily log
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            {mealTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => onSelect(type.id)}
                  style={{
                    backgroundColor:
                      colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 2,
                    borderLeftWidth: 6,
                    borderColor: theme.border,
                    borderLeftColor: type.color,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: type.color + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={24} color={type.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: theme.text,
                        marginBottom: 2,
                      }}
                    >
                      {type.label}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.icon }}>
                      {type.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// components/modals/PaymentAlertModal.tsx
import { AlertTriangle, CheckCircle2, CreditCard, XCircle } from "lucide-react-native";

interface PaymentAlertModalProps {
  visible: boolean;
  onClose: () => void;
  type: "upcoming" | "paid" | "failed" | "upcoming_cycle";
  amount: number;
  dueDate?: Date;
  onAction?: () => void;
}

export function PaymentAlertModal({
  visible,
  onClose,
  type,
  amount,
  dueDate,
  onAction,
}: PaymentAlertModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const config = {
    upcoming: {
      icon: AlertTriangle,
      color: "#FFA07A",
      title: "Payment Due Soon",
      message: `Your payment of $${amount.toFixed(
        2
      )} is due in 3 days.`,
      actionText: "View Details",
    },
    paid: {
      icon: CheckCircle2,
      color: "#10B981",
      title: "Payment Successful",
      message: `Your payment of $${amount.toFixed(2)} has been processed.`,
      actionText: "View Receipt",
    },
    failed: {
      icon: XCircle,
      color: "#EF4444",
      title: "Payment Failed",
      message: `Your payment of $${amount.toFixed(
        2
      )} was declined. Please update your payment method.`,
      actionText: "Update Payment",
    },
    upcoming_cycle: {
      icon: CreditCard,
      color: "#3B82F6",
      title: "Upcoming Billing Cycle",
      message: `Your next billing cycle starts ${
        dueDate ? dueDate.toLocaleDateString() : "soon"
      }. $${amount.toFixed(2)} will be charged.`,
      actionText: "Manage Subscription",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
            borderWidth: 2,
            borderColor: current.color,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: current.color + "20",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "center",
              marginBottom: 16,
            }}
          >
            <Icon size={32} color={current.color} />
          </View>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: theme.text,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {current.title}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: theme.icon,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            {current.message}
          </Text>

          {onAction && (
            <TouchableOpacity
              onPress={onAction}
              style={{
                backgroundColor: current.color,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
              >
                {current.actionText}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor:
                colorScheme === "dark" ? "#2a2d32" : "#f8f9fa",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "600" }}>
              {onAction ? "Later" : "OK"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}