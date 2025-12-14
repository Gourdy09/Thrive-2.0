import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
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
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

<<<<<<< Updated upstream
=======
function openHelp() {
  // TODO: Open help on website
  WebBrowser.openBrowserAsync('https://example.com');
}

function openFeedback() {
  // TODO: Open feedback on website
  WebBrowser.openBrowserAsync('https://example.com');
}

>>>>>>> Stashed changes
export default function AccountMain() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleNavigation = (screen: string) => {
    switch (screen) {
      case "settings":
        router.push("/(tabs)/account/settings");
        break;
      case "notifications":
        router.push("/(tabs)/account/notifications");
        break;
      case "subscriptions":
        router.push("/(tabs)/account/subscriptions");
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
    // TODO: do supabase integration, remove tokens, etc.
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
      <Header username="{UserName}" icon="CircleUser"/>

      {/* Settings */}
      <SectionItem
        icon={Settings}
        label="Settings"
        onPress={() => handleNavigation("settings")}
      />
      <SectionItem
        icon={CreditCard}
        label="Subscriptions"
        onPress={() => handleNavigation("subscriptions")}
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