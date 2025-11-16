import ConfirmChangeModal from "@/components/account/subscriptions/ConfirmChangeModal";
import PaymentDetailsOverview from "@/components/account/subscriptions/PaymentDetailsOverview";
import PaymentOption from "@/components/account/subscriptions/SubscriptionOption";
import { Colors } from "@/constants/Colors";
import { Plan, SubscriptionScreenProps } from "@/types/subscriptions";
import { useRouter } from "expo-router";
import { ArrowLeft, Info } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function SubscriptionsScreen ({
  currentPlan,
  selectedPlan,
  onChangePlan,
}: SubscriptionScreenProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const plans: Plan[] = [
    {
      id: "basic",
      planName: "Basic",
      price: 0,
      description: [
        { id: "1", text: "3 AI Food Scans per day" },
        { id: "2", text: "Basic Recipe Finder" },
      ],
    },
    {
      id: "plus",
      planName: "Thrive+",
      price: 10,
      description: [
        { id: "1", text: "Unlimited AI Food Scans" },
        { id: "2", text: "AI Future Predictions" },
        { id: "3", text: "Full Recipe Finder Access" },
      ],
    },
    {
      id: "pro",
      planName: "Thrive Pro",
      price: 25,
      description: [
        { id: "1", text: "Everything in Thrive+" },
        { id: "2", text: "AI Nutrition Coach" },
        { id: "3", text: "Early Access to New Tools" },
      ],
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === selectedPlan) {
      return;
    }
    setPendingPlan(planId);
    setModalVisible(true);
  };

  const confirmPlanChange = () => {
    if (pendingPlan) {
      onChangePlan(pendingPlan);
    }
    setPendingPlan(null);
    setModalVisible(false);
  };

  const cancelPlanChange = () => {
    setPendingPlan(null);
    setModalVisible(false);
  };

  const getHighlightedPlan = (planId: string) => {
    if (pendingPlan) {
      return pendingPlan === planId;
    }
    return selectedPlan === planId;
  };

  const isPlanDisabled = (planId: string) => {
    return selectedPlan === planId;
  };

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
            Subscription
          </Text>
        </View>

        {/* Payment Card Section */}
        <View style={{ marginBottom: 24 }}>
          <PaymentDetailsOverview />
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
            <View style={{
              marginTop: 1,
            }}>
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
                Plan changes will take effect on your next billing cycle (11/4/2025)
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
          Available Plans
        </Text>

        {/* Plan Options */}
        <View style={{ gap: 12 }}>
          {plans.map((plan) => (
            <PaymentOption
              key={plan.id}
              planName={plan.planName}
              description={plan.description}
              selected={getHighlightedPlan(plan.id)}
              disabled={isPlanDisabled(plan.id)}
              onSelect={() => handleSelectPlan(plan.id)}
              price={plan.price}
            />
          ))}
        </View>
      </ScrollView>

      {/* Confirm Modal */}
      <ConfirmChangeModal
        visible={modalVisible}
        onConfirm={confirmPlanChange}
        onCancel={cancelPlanChange}
      />
    </View>
  );
};