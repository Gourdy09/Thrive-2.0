import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import SubscriptionsScreen from "./SubscriptionsScreen";

export default function PaymentsContainer() {
  const [currentPlan, setCurrentPlan] = useState<string>("basic");
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchUserPlan();
    }
  }, [user]);

  async function fetchUserPlan() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_info")
        .select("subscription")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;

      const subscription = data?.subscription ?? "basic";

      setCurrentPlan(subscription);
      setSelectedPlan(subscription);
    } catch (error) {
      console.error("Error fetching subscription: ", error);
      Alert.alert("Error", "Failed to get subscription");
      setCurrentPlan("basic");
      setSelectedPlan("basic");
    } finally {
      setLoading(false);
    }
  }

  const onChangePlan = async (newPlan: string) => {
    console.log("Container: Changing plan to", newPlan);
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_info")
        .update({ subscription: newPlan })
        .eq("id", user.id);

      if (error) throw error;

      setCurrentPlan(newPlan);
      setSelectedPlan(newPlan);
      console.log("Subscription updated successfully:", data);
    } catch (error) {
      console.error("Error updating subscription: ", error);
      Alert.alert("Error", "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <SubscriptionsScreen
      currentPlan={currentPlan}
      selectedPlan={selectedPlan}
      onChangePlan={onChangePlan}
    />
  );
}
