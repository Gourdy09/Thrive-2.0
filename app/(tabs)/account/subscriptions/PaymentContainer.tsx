import type { PaymentMethodData } from "@/components/account/subscriptions/PaymentMethod";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import PaymentsScreen from "./PaymentsScreen";
export default function PaymentContainer() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    fetchPaymentMethods();
  }, [user]);

  async function fetchPaymentMethods() {
    if (!user?.id) return;
    setLoading(true);
    // TODO: Fetch payment methods from Supabase
    try {
      const { data: paymentMethodData, error: paymentMethodError } =
        await supabase.from("payment").select("*").eq("user_id", user.id);

      if (paymentMethodError) {
        console.error(
          "Supabase error fetching payment methods:",
          paymentMethodError
        );
      }

      const mockData: PaymentMethodData[] = [
        {
          id: "1",
          type: "card",
          lastFour: "4167",
          brand: "Visa",
          isDefault: true,
          supportedMethods: ["card"],
        },
        {
          id: "2",
          type: "card",
          lastFour: "8832",
          brand: "Mastercard",
          isDefault: false,
          supportedMethods: ["card"],
        },
      ];
      const dataToUse: PaymentMethodData[] =
        paymentMethodData && paymentMethodData.length > 0
          ? paymentMethodData.map((m: any) => ({
              id: m.id.toString(),
              type: m.type,
              lastFour: m.last_four,
              brand: m.brand,
              isDefault: m.is_default,
              supportedMethods: m.supported_methods || ["card"],
            }))
          : mockData;
      setPaymentMethods(dataToUse);
    } catch (error) {
      console.error(error);
      setPaymentMethods([
        {
          id: "1",
          type: "card",
          lastFour: "4167",
          brand: "Visa",
          isDefault: true,
          supportedMethods: ["card"],
        },
        {
          id: "2",
          type: "card",
          lastFour: "8832",
          brand: "Mastercard",
          isDefault: false,
          supportedMethods: ["card"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }
  const sortPaymentMethods = (methods: PaymentMethodData[]) => {
    // Sort default method to top
    return [...methods].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  };

  const handleAddPaymentMethod = async (
    method: Omit<PaymentMethodData, "id" | "isDefault">
  ) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("payment")
        .insert({
          user_id: user.id,
          method_type: method.type,
          last_Four: method.lastFour,
          bankname: method.bankName ?? null,
          is_default: paymentMethods.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newMethod: PaymentMethodData = {
        id: data.id,
        type: data.method_type,
        lastFour: data.last_Four,
        bankName: data.bankname,
        isDefault: data.is_default,
        supportedMethods: ["card"],
      };

      setPaymentMethods((prev) => sortPaymentMethods([...prev, newMethod]));

      setModalVisible(false);
    } catch (error) {
      console.error("error in adding payment method:", error);
      Alert.alert("Error", "Failed to add payment method");
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return;
    console.log("Container: Setting default payment method", id);
    try {
      const { error: resetError } = await supabase
        .from("payment")
        .update({ is_default: false })
        .eq("user_id", user.id);

      if (resetError) throw resetError;

      const { data, error } = await supabase
        .from("payment")
        .update({ default: true })
        .eq("id", id);

      const updatedMethods = paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }));
      setPaymentMethods(sortPaymentMethods(updatedMethods));
    } catch (error) {
      console.error("Error setting as default:", error);
      Alert.alert("Error", "Failed to set as default method");
    }
  };

  const handleRemove = async (id: string) => {
    if (!user?.id) return;
    console.log("Container: Removing payment method", id);
    try {
      console.log("Attempting to delete payment:", { id, user_id: user.id });

      const { error } = await supabase
        .from("payment")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id);
      setPaymentMethods((methods) => methods.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error removing payment method:", error);
      Alert.alert("Error", "Failed to remove payment method");
    }
  };

  if (loading) return null;

  return (
    <PaymentsScreen
      paymentMethods={paymentMethods}
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      handleAddPaymentMethod={handleAddPaymentMethod}
      handleSetDefault={handleSetDefault}
      handleRemove={handleRemove}
    />
  );
}
