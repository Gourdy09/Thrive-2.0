import { PaymentMethodData } from "@/components/settings/subscriptions/PaymentMethod";
import { useEffect, useState } from "react";
import PaymentsScreen from "./PaymentsScreen";

export default function PaymentContainer() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // TODO: Replace with actual data from Supabase
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      setLoading(true);
      // TODO: Fetch payment methods from Supabase
      const data = [
        {
          id: '1',
          type: 'card' as const,
          lastFour: '4167',
          brand: 'Visa',
          isDefault: true,
        },
        {
          id: '2',
          type: 'card' as const,
          lastFour: '8832',
          brand: 'Mastercard',
          isDefault: false,
        },
      ];
      setPaymentMethods(data);
      setLoading(false);
    }
    fetchPaymentMethods();
  }, []);

  const sortPaymentMethods = (methods: PaymentMethodData[]) => {
    return [...methods].sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return 0;
    });
  };

  const handleAddPaymentMethod = async (method: Omit<PaymentMethodData, 'id' | 'isDefault'>) => {
    console.log("Container: Adding payment method", method);
    const newMethod: PaymentMethodData = {
      ...method,
      id: Date.now().toString(),
      isDefault: paymentMethods.length === 0,
    };
    // TODO: Add payment method to Supabase
    const updatedMethods = sortPaymentMethods([...paymentMethods, newMethod]);
    setPaymentMethods(updatedMethods);
    setModalVisible(false);
  };

  const handleSetDefault = async (id: string) => {
    console.log("Container: Setting default payment method", id);
    // TODO: Update default payment method in Supabase
    const updatedMethods = paymentMethods.map(m => ({ ...m, isDefault: m.id === id }));
    setPaymentMethods(sortPaymentMethods(updatedMethods));
  };

  const handleRemove = async (id: string) => {
    console.log("Container: Removing payment method", id);
    // TODO: Remove payment method from Supabase
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
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