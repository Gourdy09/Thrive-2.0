import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";

export default function FeedbackScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const router = useRouter();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <SafeAreaView 
        style={{ 
          flex: 1, 
          backgroundColor: theme.background 
        }}
      >
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: theme.background, 
            padding: 24 
          }}
        >
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{ 
              marginBottom: 24,
              padding: 8,
              marginLeft: -8,
            }}
          >
            <ArrowLeft size={24} color={theme.tint} />
          </TouchableOpacity>

          <Text 
            style={{ 
              fontSize: 24, 
              fontWeight: "600", 
              color: theme.text,
              marginBottom: 24
            }}
          >
            Feedback
          </Text>
          
          {/* Add your feedback content here */}
          <Text 
            style={{ 
              fontSize: 16, 
              color: theme.text,
              opacity: 0.7
            }}
          >
            Feedback content will be added here...
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}