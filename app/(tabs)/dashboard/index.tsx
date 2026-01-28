import DashboardReport from "@/components/dashboard/DashboardReport";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { addGlucoseEntry } from "@/storage/glucoseLog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { default as React, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
function AnimatedDropdown({
  label,
  messgae1,
  value1,
  options,
  onSelect,
  value2,
  message2,
  onChangeText,
  colorScheme,
  theme,
  show,
}: {
  label: string;
  messgae1: string;
  value1: string;
  options: string[];
  message2: string;
  onSelect: (value: string) => void;
  onChangeText: (value: string) => void;
  value2: string;
  colorScheme: string;
  theme: any;
  show: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  const toggleDropdown = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(rotateAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const itemHeight = 48;
  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, options.length * itemHeight + 16],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  if (show) {
    return (
      <View style={{ marginBottom: 20 }}>
        {/* Section Label */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: theme.text,
            marginBottom: 12,
            marginTop: 20,
          }}
        >
          {label}
        </Text>

        {/* Dropdown Trigger */}
        <TouchableOpacity
          onPress={toggleDropdown}
          style={{
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
            borderWidth: 2,
            borderRadius: 12,
            padding: 16,
            borderColor: isOpen ? theme.tint : theme.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.text, fontSize: 16 }}>
            {value1 || messgae1}
          </Text>

          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronDown size={20} color={theme.icon} />
          </Animated.View>
        </TouchableOpacity>

        {/* Dropdown Options */}
        <Animated.View style={{ maxHeight, overflow: "hidden" }}>
          <View
            style={{
              marginTop: 8,
              borderRadius: 12,
              backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
              borderWidth: 2,
              borderColor: theme.border,
              overflow: "hidden",
            }}
          >
            {options.map((option, index) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  onSelect(option);
                  toggleDropdown();
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: theme.border,
                  backgroundColor:
                    value1 === option
                      ? colorScheme === "dark"
                        ? "#252830"
                        : "#e8f0ff"
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    color: value1 === option ? theme.tint : theme.text,
                    fontWeight: value1 === option ? "600" : "400",
                  }}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Blood Sugar Input */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: theme.text,
              marginBottom: 8,
            }}
          >
            {message2}
          </Text>

          <TextInput
            placeholder="e.g. 110"
            keyboardType="numeric"
            placeholderTextColor={theme.icon}
            onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
            style={{
              backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
              borderWidth: 2,
              borderRadius: 12,
              padding: 16,
              color: theme.text,
              fontSize: 16,
              borderColor: theme.border,
            }}
          />
        </View>
      </View>
    );
  } else {
    return null;
  }
}

export default function index() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  const bloodGlucoseLevel = 0;
  const units = "mg/dL";
  const deltaSugar = -0;
  const expectedChange = 0;
  const { user } = useAuth();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const [entryType, setEntryType] = useState("");
  const [bloodSugarLvl, setBloodSugarLvl] = useState("");
  const [dailyEntries, setDailyEntries] = useState<GlucoseEntry[]>([]);
  const MAX_ENTRIES = 3;

  type GlucoseEntry = {
    glucose_mg_dl: number;
    timestamp: string;
    context: string[];
  };
  const onSave = async () => {
    if (!bloodSugarLvl || !entryType) return null;

    try {
      const newEntry = await addGlucoseEntry({
        glucose_mg_dl: Number(bloodSugarLvl),
        context: [entryType],
      });

      setDailyEntries((prev) => [...prev, newEntry]);
      setEntryType("");
      setBloodSugarLvl("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  const showDropdown = dailyEntries.length < MAX_ENTRIES;

  interface GlucoseReading {
    value: number;
    timestamp: Date;
  }
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isFocused = useIsFocused();
  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${hour}${suffix}`;
  });

  const { checkProfileComplete } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("SugarData");
        if (jsonValue != null) {
          const parsed: GlucoseReading[] = JSON.parse(jsonValue).map(
            (d: any) => ({
              timestamp: new Date(d.timestamp),
              value: d.value,
            }),
          );
          setGlucoseData(parsed);
        } else {
          const now = new Date();
          const mock: GlucoseReading[] = Array.from({ length: 8 }, (_, i) => ({
            timestamp: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              i,
            ),
            value: 90 + Math.floor(Math.random() * 40),
          }));
          setGlucoseData(mock);
        }
      } catch (e) {
        console.error("loading Errror:", e);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    const checkProfile = async () => {
      if (user?.id && !alertShown) {
        try {
          const isComplete = await checkProfileComplete(user.id);
          setProfileComplete(isComplete);

          if (!isComplete) {
            setAlertShown(true);
            Alert.alert(
              "Complete your profile",
              "Please complete your profile settings to continue.",
              [
                {
                  text: "Go to Settings",
                  onPress: () => router.push("/(tabs)/account/settings"),
                },
                {
                  text: "Later",
                  style: "cancel",
                  onPress: () => setAlertShown(false),
                },
              ],
            );
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
    };

    checkProfile();
  }, [user, alertShown]);

  const chartWidth = Math.max(Dimensions.get("window").width * 4, 800);
  const centerScroll = () => {
    if (scrollViewRef.current) {
      const currentHour = new Date().getHours();
      const screenWidth = Dimensions.get("window").width;
      const hourWidth = chartWidth / 24;
      const scrollX = currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollX),
          animated: true,
        });
      }, 100);
    }
  };

  useEffect(() => {
    if (glucoseData.length > 0) {
      centerScroll();
    }
  }, [glucoseData, chartWidth]);

  useEffect(() => {
    if (isFocused) {
      centerScroll();
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        const currentHour = new Date().getHours();
        const screenWidth = Dimensions.get("window").width;
        const hourWidth = chartWidth / 24;
        const scrollX =
          currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: Math.max(0, scrollX),
            animated: false,
          });
        }, 100);
      }
    }, [chartWidth]),
  );

  const hourlyValues = Array(24).fill(null);
  glucoseData.forEach((d) => {
    const hour = d.timestamp.getHours();
    hourlyValues[hour] = d.value;
  });
  let lastValue = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyValues[i] == null) hourlyValues[i] = lastValue;
    else lastValue = hourlyValues[i];
  }
  const chartData = {
    labels: hourLabels,
    datasets: [
      {
        data: hourlyValues,
      },
    ],
  };
  const username = (user?.email as string)?.split("@")[0] || "User";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 14,
        paddingTop: 60,
      }}
    >
      {/* Header */}
      <Header username={username} icon="LayoutDashboard" />

      {/* Report Card */}
      <DashboardReport
        bloodGlucoseLevel={bloodGlucoseLevel}
        units={units}
        deltaSugar={deltaSugar}
        expectedChange={expectedChange}
      />
      <ScrollView>
        <GlucoseChart />
      </ScrollView>

      <AnimatedDropdown
        label="Blood Sugar Entry"
        messgae1="Please select which type of entry this is"
        value1={entryType}
        options={["Pre-meal", "~60 min post-meal", "Wake up"]}
        onSelect={setEntryType}
        message2="Please enter your blood sugar level (mg/dL)"
        value2={bloodSugarLvl}
        onChangeText={setBloodSugarLvl}
        colorScheme={colorScheme}
        theme={theme}
        show={showDropdown}
      />
    </View>
  );
}
