import { Colors } from "@/constants/Colors";
import { Building2, CreditCard, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { PaymentMethodData } from "./PaymentMethod";

interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (method: Omit<PaymentMethodData, "id" | "isDefault">) => void;
}

export default function AddPaymentModal({
  visible,
  onClose,
  onAdd
}: AddPaymentModalProps) {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const [paymentType, setPaymentType] = useState<"card" | "bank">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /** ─────────────── Utility Functions ─────────────── */

  const luhnCheck = (num: string) => {
    const arr = num
      .split("")
      .reverse()
      .map(x => parseInt(x));
    const lastDigit = arr.shift() || 0;
    let sum = arr.reduce(
      (acc, val, i) =>
        i % 2 === 0
          ? acc + ((val * 2 > 9 ? val * 2 - 9 : val * 2))
          : acc + val,
      0
    );
    sum += lastDigit;
    return sum % 10 === 0;
  };

  const detectCardBrand = (num: string) => {
    if (/^4/.test(num)) return "Visa";
    if (/^5[1-5]/.test(num)) return "Mastercard";
    if (/^3[47]/.test(num)) return "American Express";
    if (/^6(?:011|5)/.test(num)) return "Discover";
    return "Unknown";
  };

  const formatCardNumber = (num: string) => {
    const digits = num.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length <= 2) return cleaned;
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
  };

  /** ─────────────── Validation ─────────────── */

  useEffect(() => {
    const newErrors: { [key: string]: string } = {};

    if (paymentType === "card") {
      const rawNum = cardNumber.replace(/\s/g, "");

      if (touched.cardNumber) {
        if (!/^\d{13,19}$/.test(rawNum)) {
          newErrors.cardNumber = "Invalid card number length";
        } else if (!luhnCheck(rawNum)) {
          newErrors.cardNumber = "Invalid card number";
        }
      }

      if (touched.expiryDate) {
        const [month, year] = expiryDate.split("/");
        if (!month || parseInt(month) > 12) {
          newErrors.expiryDate = "Invalid month";
        } else if (expiryDate.length < 5) {
          newErrors.expiryDate = "Incomplete expiry date";
        }
      }

      if (touched.cvv && !/^\d{3,4}$/.test(cvv)) {
        newErrors.cvv = "Invalid CVV";
      }

      const allFilled = Boolean(cardNumber && expiryDate && cvv);
      setIsFormValid(allFilled && Object.keys(newErrors).length === 0);
    }

    if (paymentType === "bank") {
      if (touched.accountNumber && !/^\d+$/.test(accountNumber)) {
        newErrors.accountNumber = "Account number must be numeric";
      }
      if (touched.routingNumber && !/^\d{9}$/.test(routingNumber)) {
        newErrors.routingNumber = "Routing number must be 9 digits";
      }

      const allFilled = Boolean(accountNumber && routingNumber && bankName);
      setIsFormValid(allFilled && Object.keys(newErrors).length === 0);
    }

    setErrors(newErrors);
  }, [
    cardNumber,
    expiryDate,
    cvv,
    accountNumber,
    routingNumber,
    bankName,
    paymentType,
    touched
  ]);


  /** ─────────────── Handlers ─────────────── */

  const handleAdd = () => {
    if (!isFormValid) return;

    if (paymentType === "card") {
      const rawNum = cardNumber.replace(/\s/g, "");
      onAdd({
        type: "card",
        lastFour: rawNum.slice(-4),
        brand: detectCardBrand(rawNum)
      });
    } else {
      onAdd({
        type: "bank",
        lastFour: accountNumber.slice(-4),
        bankName: bankName || "Bank Account"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setAccountNumber("");
    setRoutingNumber("");
    setBankName("");
    setPaymentType("card");
    setTouched({});
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  /** ─────────────── UI ─────────────── */

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)"
        }}
      >
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            maxHeight: "85%"
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: theme.text }}>
              Add Payment Method
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={theme.icon} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Payment Type Selector */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              {[
                { type: "card", icon: CreditCard, label: "Card" },
                { type: "bank", icon: Building2, label: "Bank" }
              ].map(({ type, icon: Icon, label }) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setPaymentType(type as any)}
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor:
                      paymentType === type ? theme.tint : theme.border,
                    backgroundColor:
                      colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                    alignItems: "center"
                  }}
                >
                  <Icon
                    size={24}
                    color={paymentType === type ? theme.tint : theme.icon}
                  />
                  <Text
                    style={{
                      color: paymentType === type ? theme.text : theme.icon,
                      fontWeight: "600",
                      marginTop: 8
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CARD FORM */}
            {paymentType === "card" && (
              <View style={{ gap: 16 }}>
                {/* Card Number */}
                <View>
                  <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                    Card Number
                  </Text>
                  <TextInput
                    value={cardNumber}
                    onChangeText={v => setCardNumber(formatCardNumber(v))}
                    onBlur={() => setTouched(p => ({ ...p, cardNumber: true }))}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.icon}
                    keyboardType="number-pad"
                    style={{
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                      borderWidth: 2,
                      borderColor:
                        touched.cardNumber && errors.cardNumber
                          ? "red"
                          : theme.border,
                      borderRadius: 12,
                      padding: 16,
                      color: theme.text,
                      fontSize: 16
                    }}
                  />
                  {touched.cardNumber && errors.cardNumber && (
                    <Text style={{ color: "red", marginTop: 4 }}>
                      {errors.cardNumber}
                    </Text>
                  )}
                </View>

                {/* Expiry + CVV */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                      Expiry Date
                    </Text>
                    <TextInput
                      value={expiryDate}
                      onChangeText={v => setExpiryDate(formatExpiry(v))}
                      onBlur={() => setTouched(p => ({ ...p, expiryDate: true }))}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.icon}
                      keyboardType="number-pad"
                      style={{
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                        borderWidth: 2,
                        borderColor:
                          touched.expiryDate && errors.expiryDate
                            ? "red"
                            : theme.border,
                        borderRadius: 12,
                        padding: 16,
                        color: theme.text,
                        fontSize: 16
                      }}
                    />
                    {touched.expiryDate && errors.expiryDate && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors.expiryDate}
                      </Text>
                    )}
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                      CVV
                    </Text>
                    <TextInput
                      value={cvv}
                      onChangeText={setCvv}
                      onBlur={() => setTouched(p => ({ ...p, cvv: true }))}
                      placeholder="123"
                      placeholderTextColor={theme.icon}
                      keyboardType="number-pad"
                      secureTextEntry
                      style={{
                        backgroundColor:
                          colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                        borderWidth: 2,
                        borderColor:
                          touched.cvv && errors.cvv ? "red" : theme.border,
                        borderRadius: 12,
                        padding: 16,
                        color: theme.text,
                        fontSize: 16
                      }}
                    />
                    {touched.cvv && errors.cvv && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        {errors.cvv}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* BANK FORM */}
            {paymentType === "bank" && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                    Bank Name
                  </Text>
                  <TextInput
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="Chase Bank"
                    placeholderTextColor={theme.icon}
                    onBlur={() => setTouched(p => ({ ...p, bankName: true }))}
                    style={{
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                      borderWidth: 2,
                      borderColor: theme.border,
                      borderRadius: 12,
                      padding: 16,
                      color: theme.text,
                      fontSize: 16
                    }}
                  />
                </View>

                <View>
                  <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                    Account Number
                  </Text>
                  <TextInput
                    value={accountNumber}
                    onChangeText={v =>
                      setAccountNumber(v.replace(/\D/g, ""))
                    }
                    onBlur={() =>
                      setTouched(p => ({ ...p, accountNumber: true }))
                    }
                    placeholder="123456789"
                    placeholderTextColor={theme.icon}
                    keyboardType="number-pad"
                    secureTextEntry
                    style={{
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                      borderWidth: 2,
                      borderColor:
                        touched.accountNumber && errors.accountNumber
                          ? "red"
                          : theme.border,
                      borderRadius: 12,
                      padding: 16,
                      color: theme.text,
                      fontSize: 16
                    }}
                  />
                  {touched.accountNumber && errors.accountNumber && (
                    <Text style={{ color: "red", marginTop: 4 }}>
                      {errors.accountNumber}
                    </Text>
                  )}
                </View>

                <View>
                  <Text style={{ color: theme.icon, marginBottom: 8, fontWeight: "600" }}>
                    Routing Number
                  </Text>
                  <TextInput
                    value={routingNumber}
                    onChangeText={v =>
                      setRoutingNumber(v.replace(/\D/g, "").slice(0, 9))
                    }
                    onBlur={() =>
                      setTouched(p => ({ ...p, routingNumber: true }))
                    }
                    placeholder="021000021"
                    placeholderTextColor={theme.icon}
                    keyboardType="number-pad"
                    style={{
                      backgroundColor:
                        colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                      borderWidth: 2,
                      borderColor:
                        touched.routingNumber && errors.routingNumber
                          ? "red"
                          : theme.border,
                      borderRadius: 12,
                      padding: 16,
                      color: theme.text,
                      fontSize: 16
                    }}
                  />
                  {touched.routingNumber && errors.routingNumber && (
                    <Text style={{ color: "red", marginTop: 4 }}>
                      {errors.routingNumber}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!isFormValid}
              style={{
                backgroundColor: isFormValid ? theme.tint : theme.border,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 24
              }}
            >
              <Text
                style={{
                  color: theme.background,
                  fontWeight: "700",
                  fontSize: 16
                }}
              >
                Add Payment Method
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
