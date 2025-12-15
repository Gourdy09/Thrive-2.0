import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Droplet, Eye, EyeOff } from "lucide-react-native";
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

export default function SignupScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("../(tabs)/dashboard") },
      ]); // turn back on email confirmation later on
      // User will be auto-logged in
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", error.message || "Could not create account");
    } finally {
      setLoading(false);
    }
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
          <View style={{ alignItems: "center", marginBottom: 40 }}>
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
              Create Account
            </Text>
            <Text style={{ fontSize: 16, color: theme.icon }}>
              Join Thrive today
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
          <View style={{ marginBottom: 16 }}>
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
                placeholder="At least 8 characters"
                placeholderTextColor={theme.icon}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
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

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Confirm Password
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor={theme.icon}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                style={{
                  backgroundColor:
                    colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
                  borderWidth: 2,
                  borderColor:
                    confirmPassword && password !== confirmPassword
                      ? "#ef4444"
                      : theme.border,
                  borderRadius: 12,
                  padding: 16,
                  paddingRight: 50,
                  color: theme.text,
                  fontSize: 16,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                }}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={theme.icon} />
                ) : (
                  <Eye size={20} color={theme.icon} />
                )}
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                Passwords do not match
              </Text>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            onPress={handleSignup}
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
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ color: theme.icon, fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
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

          {/* Terms */}
          <Text
            style={{
              color: theme.icon,
              fontSize: 12,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            By creating an account, you agree to our{"\n"}
            <Text style={{ color: theme.tint }}>Terms of Service</Text> and{" "}
            <Text style={{ color: theme.tint }}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
