import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { Droplet, Eye, EyeOff } from "lucide-react-native";
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

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);

      setLoading(false);
      router.push("/(tabs)/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message || "Invalid credentials");
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("./resetPassword");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            justifyContent: "center",
          }}
        >
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
              <Droplet size={40} color={theme.tint} fill={theme.tint} />
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Welcome Back
            </Text>
            <Text style={{ fontSize: 16, color: theme.icon }}>
              Sign in to continue
            </Text>
          </View>

          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Email
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

          {/* Password Input */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Password
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.icon}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderColor: theme.border,
                  borderRadius: 12,
                  padding: 16,
                  paddingRight: 50,
                  color: theme.text,
                  fontSize: 16,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                }}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.icon} />
                ) : (
                  <Eye size={20} color={theme.icon} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{ alignSelf: "flex-end", marginBottom: 24 }}
            onPress={handleForgotPassword}
          >
            <Text
              style={{ color: theme.tint, fontSize: 14, fontWeight: "600" }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
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
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.icon, fontSize: 14 }}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text
                style={{
                  color: theme.tint,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
