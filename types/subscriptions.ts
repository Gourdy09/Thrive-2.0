import { PaymentMethodData } from "@/components/settings/subscriptions/PaymentMethod";

export interface PlanDescription {
  id: string;
  text: string;
}

export interface Plan {
  id: string;
  price: number;
  planName: string;
  description: PlanDescription[];
}

export interface SubscriptionScreenProps {
  currentPlan: string;
  selectedPlan: string;
  onChangePlan: (planId: string) => void;
}

export interface PaymentScreenProps {
  paymentMethods: PaymentMethodData[];
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  handleAddPaymentMethod: (method: Omit<PaymentMethodData, 'id' | 'isDefault'>) => void;
  handleSetDefault: (id: string) => void;
  handleRemove: (id: string) => void;
}