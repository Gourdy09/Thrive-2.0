import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email || !validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "your-app://reset-password",
      });

      if (error) throw error;

      Alert.alert(
        "Check Your Email",
        "Password reset instructions have been sent to your email.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 60,
              left: 24,
              padding: 8,
              zIndex: 10,
            }}
          >
            <ArrowLeft size={24} color={theme.tint} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.tint + "20",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Mail size={40} color={theme.tint} />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.icon,
                textAlign: "center",
                paddingHorizontal: 20,
                lineHeight: 22,
              }}
            >
              Enter your email and we'll send you instructions to reset your
              password
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Email Address
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={theme.icon}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 12,
                padding: 16,
                color: theme.text,
                fontSize: 16,
              }}
            />
          </View>

          {/* Send Reset Email Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            style={{
              backgroundColor: theme.tint,
              padding: 18,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 16,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <Text
                style={{
                  color: theme.background,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Send Reset Instructions
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.icon, fontSize: 14 }}>
              Remember your password?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                style={{
                  color: theme.tint,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
