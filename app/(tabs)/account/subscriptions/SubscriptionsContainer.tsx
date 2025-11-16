import React, { useEffect, useState } from "react";
import SubscriptionsScreen from "./SubscriptionsScreen";

export default function PaymentsContainer() {
  // TODO: Change useState("basic") to getting currentPlan from supabase
  const [currentPlan, setCurrentPlan] = useState<string>("basic");
  const [selectedPlan, setSelectedPlan] = useState<string>("basic");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserPlan() {
      setLoading(true);
      // TODO: fetch current plan from Supabase
      const data = { plan: "basic" };
      setCurrentPlan(data.plan);
      setSelectedPlan(data.plan);
      setLoading(false);
    }
    fetchUserPlan();
  }, []);

  const onChangePlan = async (newPlan: string) => {
    console.log("Container: Changing plan to", newPlan);
    // TODO: update Supabase here
    setCurrentPlan(newPlan); // disables the new current plan
    setSelectedPlan(newPlan); // persists highlight
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
