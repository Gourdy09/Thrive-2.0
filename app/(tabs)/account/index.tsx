// app/(tabs)/account/index.tsx
"use client";

import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    CreditCard,
    HelpCircle,
    LogOut,
    MessageSquare,
    Settings,
} from "lucide-react-native";
import {
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export default function AccountMain() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case "settings":
        router.push("/(tabs)/account/settings");
        break;
      case "notifications":
        router.push("/(tabs)/account/notifications");
        break;
      case "payments":
        router.push("/(tabs)/account/payments");
        break;
      case "help":
        router.push("/(tabs)/account/help");
        break;
      case "feedback":
        router.push("/(tabs)/account/feedback");
        break;
      default:
        console.warn("Unknown screen:", screen);
    }
  };

  const handleLogout = () => {
    console.log("User logged out");
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 24,
        paddingTop: 60,
      }}
    >
      {/* Profile Header */}
      <TouchableOpacity
        onPress={() => handleNavigation("settings")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.tint,
            marginRight: 12,
          }}
        />
        <View>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: "600" }}>
            Jin Yong Lim
          </Text>
          <Text style={{ color: theme.icon, fontSize: 14 }}>Edit profile</Text>
        </View>
      </TouchableOpacity>

      {/* Settings */}
      <SectionItem
        icon={Settings}
        label="Settings"
        onPress={() => handleNavigation("settings")}
      />
      <SectionItem
        icon={CreditCard}
        label="Payment methods"
        onPress={() => handleNavigation("payments")}
      />
      <SectionItem
        icon={Bell}
        label="Notifications"
        onPress={() => handleNavigation("notifications")}
      />

      {/* Help */}
      <View style={{ height: 24 }} />
      <SectionItem
        icon={HelpCircle}
        label="Help Center"
        onPress={() => handleNavigation("help")}
      />
      <SectionItem
        icon={MessageSquare}
        label="Give us feedback"
        onPress={() => handleNavigation("feedback")}
      />

      {/* Logout */}
      <View style={{ height: 24 }} />
      <SectionItem
        icon={LogOut}
        label="Log out"
        onPress={handleLogout}
        showChevron={false}
        danger
      />

      {/* Footer */}
      <View style={{ marginTop: 40, alignItems: "center", opacity: 0.5 }}>
        <Text style={{ color: theme.text, fontSize: 12 }}>
          Version 1.0.2 (72)
        </Text>
        <TouchableOpacity>
          <Text style={{ color: theme.text, fontSize: 12, marginTop: 4 }}>
            Terms of Service
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SectionItem({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: colorScheme === "dark" ? "#2A2D2F" : "#E2E4E7",
      }}
    >
      <Icon color={danger ? "#f43f5e" : theme.icon} size={20} />
      <Text
        style={{
          marginLeft: 16,
          fontSize: 16,
          color: danger ? "#f43f5e" : theme.text,
          flex: 1,
        }}
      >
        {label}
      </Text>
      {showChevron && <ChevronRight color={theme.icon} size={20} />}
    </TouchableOpacity>
  );
}
