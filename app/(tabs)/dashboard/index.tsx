import DashboardReport from "@/components/dashboard/DashboardReport";
import GlucoseChart from "@/components/dashboard/GlucoseChart";
import Header from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useGlucoseForecast } from "@/hooks/useglucoseforecast";
import type { GlucoseContext } from "@/lib/db";
import { syncAll } from "@/lib/supabaseSync";
import {
  addGlucoseEntry,
  getGlucoseLogForDay,
  secondsSinceLastReading,
  type GlucoseEntry,
} from "@/storage/glucoseLog";
import { saveGlucosePredictions } from "@/storage/glucosePredictions";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
const HOURLY_PROMPT_INTERVAL_S = 60 * 60;
const MAX_DAILY_ENTRIES = 24;

const CONTEXT_OPTIONS: { label: string; value: GlucoseContext }[] = [
  { label: "Wake up", value: "wake_up" },
  { label: "Pre-meal", value: "pre_meal" },
  { label: "~60 min post-meal", value: "post_meal_60" },
  { label: "Hourly check", value: "hourly" },
  { label: "Other", value: "other" },
];

function AnimatedDropdown({
  label,
  placeholder,
  selectedValue,
  options,
  onSelect,
  inputLabel,
  inputValue,
  onChangeText,
  theme,
  colorScheme,
  visible,
  promptActive,
}: {
  label: string;
  placeholder: string;
  selectedValue: GlucoseContext | "";
  options: { label: string; value: GlucoseContext }[];
  onSelect: (v: GlucoseContext) => void;
  inputLabel: string;
  inputValue: string;
  onChangeText: (v: string) => void;
  theme: any;
  colorScheme: string;
  visible: boolean;
  promptActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  const toggle = () => {
    const to = isOpen ? 0 : 1;
    Animated.parallel([
      Animated.spring(animation, {
        toValue: to,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(rotateAnim, {
        toValue: to,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    setIsOpen((o) => !o);
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, options.length * 48 + 16],
  });
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label ?? placeholder;

  if (!visible) return null;

  const borderColor = promptActive
    ? "#f59e0b"
    : isOpen
      ? theme.tint
      : theme.border;

  return (
    <View style={{ marginBottom: 20 }}>
      {promptActive && (
        <View
          style={{
            backgroundColor: "#f59e0b22",
            borderRadius: 10,
            padding: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#f59e0b", fontWeight: "600", fontSize: 13 }}>
            ⏰ It's been over an hour — time for a glucose check!
          </Text>
        </View>
      )}

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: theme.text,
          marginBottom: 12,
          marginTop: 12,
        }}
      >
        {label}
      </Text>

      <TouchableOpacity
        onPress={toggle}
        style={{
          backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
          borderWidth: 2,
          borderRadius: 12,
          padding: 16,
          borderColor,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16 }}>{selectedLabel}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={theme.icon} />
        </Animated.View>
      </TouchableOpacity>

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
          {options.map((opt, idx) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                onSelect(opt.value);
                toggle();
              }}
              style={{
                padding: 16,
                borderBottomWidth: idx < options.length - 1 ? 1 : 0,
                borderBottomColor: theme.border,
                backgroundColor:
                  selectedValue === opt.value
                    ? colorScheme === "dark"
                      ? "#252830"
                      : "#e8f0ff"
                    : "transparent",
              }}
            >
              <Text
                style={{
                  color: selectedValue === opt.value ? theme.tint : theme.text,
                  fontWeight: selectedValue === opt.value ? "600" : "400",
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <View style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: theme.text,
            marginBottom: 8,
          }}
        >
          {inputLabel}
        </Text>
        <TextInput
          placeholder="e.g. 110"
          keyboardType="numeric"
          placeholderTextColor={theme.icon}
          value={inputValue}
          onChangeText={(t) => onChangeText(t.replace(/[^0-9]/g, ""))}
          style={{
            backgroundColor: colorScheme === "dark" ? "#1c1e22" : "#f8f9fa",
            borderWidth: 2,
            borderRadius: 12,
            padding: 16,
            color: theme.text,
            fontSize: 16,
            borderColor: promptActive ? "#f59e0b" : theme.border,
          }}
        />
      </View>
    </View>
  );
}

interface GlucoseReading {
  value: number;
  timestamp: Date;
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];
  const { user, checkProfileComplete } = useAuth();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [profileComplete, setProfileComplete] = useState(true);
  const [alertShown, setAlertShown] = useState(false);
  const [entryContext, setEntryContext] = useState<GlucoseContext | "">("");
  const [bloodSugarLvl, setBloodSugarLvl] = useState("");
  const [dailyEntries, setDailyEntries] = useState<GlucoseEntry[]>([]);
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const [hourlyPrompt, setHourlyPrompt] = useState(false);

  const chartScrollRef = useRef<ScrollView>(null);
  const promptTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const savedForecastKeyRef = useRef<string | null>(null);

  const chartWidth = Math.max(Dimensions.get("window").width * 4, 800);
  const todayStr = new Date().toISOString().split("T")[0];
  const username = (user?.email as string)?.split("@")[0] || "User";

  const checkHourlyPrompt = useCallback(async () => {
    const elapsed = await secondsSinceLastReading();
    setHourlyPrompt(elapsed >= HOURLY_PROMPT_INTERVAL_S);
  }, []);

  const schedulePromptCheck = useCallback(() => {
    if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    promptTimerRef.current = setInterval(checkHourlyPrompt, 5 * 60 * 1000);
  }, [checkHourlyPrompt]);

  useEffect(() => {
    checkHourlyPrompt();
    schedulePromptCheck();

    const sub = AppState.addEventListener("change", (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        checkHourlyPrompt();
        syncAll();
      }
      appStateRef.current = nextState;
    });

    return () => {
      if (promptTimerRef.current) clearInterval(promptTimerRef.current);
      sub.remove();
    };
  }, [checkHourlyPrompt, schedulePromptCheck]);

  const loadTodayEntries = useCallback(async () => {
    const entries = await getGlucoseLogForDay(todayStr);
    setDailyEntries(entries);
    setGlucoseData(
      entries.map((e) => ({
        value: e.glucose_mg_dl,
        timestamp: new Date(e.timestamp),
      })),
    );
  }, [todayStr]);

  useEffect(() => {
    loadTodayEntries();
  }, [user, loadTodayEntries]);

  useFocusEffect(
    useCallback(() => {
      loadTodayEntries();
      checkHourlyPrompt();
    }, [loadTodayEntries, checkHourlyPrompt]),
  );

  const onSave = async () => {
    if (!bloodSugarLvl || !entryContext) {
      Alert.alert("Missing info", "Please choose a context and enter a value.");
      return;
    }

    try {
      await addGlucoseEntry({
        glucose_mg_dl: Number(bloodSugarLvl),
        context: entryContext,
      });
      setEntryContext("");
      setBloodSugarLvl("");
      setHourlyPrompt(false);
      await loadTodayEntries();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (!user?.id || alertShown) return;
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
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };
    checkProfile();
  }, [user, alertShown]);

  const centerScroll = useCallback(() => {
    if (!chartScrollRef.current) return;
    const currentHour = new Date().getHours();
    const screenWidth = Dimensions.get("window").width;
    const hourWidth = chartWidth / 24;
    const scrollX = currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;
    setTimeout(() => {
      chartScrollRef.current?.scrollTo({
        x: Math.max(0, scrollX),
        animated: true,
      });
    }, 100);
  }, [chartWidth]);

  useEffect(() => {
    if (glucoseData.length > 0) centerScroll();
  }, [glucoseData, centerScroll]);
  useEffect(() => {
    if (isFocused) centerScroll();
  }, [isFocused, centerScroll]);

  useFocusEffect(
    useCallback(() => {
      if (!chartScrollRef.current) return;
      const currentHour = new Date().getHours();
      const screenWidth = Dimensions.get("window").width;
      const hourWidth = chartWidth / 24;
      const scrollX = currentHour * hourWidth - screenWidth / 2 + hourWidth / 2;
      setTimeout(() => {
        chartScrollRef.current?.scrollTo({
          x: Math.max(0, scrollX),
          animated: false,
        });
      }, 100);
    }, [chartWidth]),
  );
  const { data: forecastData } = useGlucoseForecast();

  useEffect(() => {
    if (!forecastData?.timePoints?.length) return;

    const forecastKey = `${forecastData.timePoints[0]}_${forecastData.mu[0]}`;
    if (savedForecastKeyRef.current === forecastKey) return;
    savedForecastKeyRef.current = forecastKey;

    const predictedAt = new Date().toISOString();

    const rows = forecastData.timePoints.map((tp, i) => ({
      predicted_at: predictedAt,
      time_point: tp,
      mu: forecastData.mu[i],
      lower: forecastData.lower[i],
      upper: forecastData.upper[i],
    }));

    saveGlucosePredictions(rows);
  }, [forecastData]);

  const currentForecastIndex = React.useMemo(() => {
    if (!forecastData?.timePoints?.length) return -1;

    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    let closestIdx = 0;
    let minDiff = Infinity;

    forecastData.timePoints.forEach((t, i) => {
      const diff = Math.abs(t - currentHour);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });

    return closestIdx;
  }, [forecastData]);

  const predictedNow =
    currentForecastIndex >= 0
      ? Math.round(forecastData?.mu?.[currentForecastIndex] ?? 0)
      : 0;

  const findClosestIndexForHourOffset = (offsetHours: number) => {
    if (!forecastData?.timePoints?.length || currentForecastIndex < 0)
      return -1;
    const target = forecastData.timePoints[currentForecastIndex] + offsetHours;
    let closestIdx = currentForecastIndex;
    let minDiff = Infinity;
    forecastData.timePoints.forEach((t, i) => {
      const diff = Math.abs(t - target);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    });
    return closestIdx;
  };

  const idxPast = findClosestIndexForHourOffset(-2);
  const idxFuture = findClosestIndexForHourOffset(2);

  const predicted2HoursAgo =
    idxPast >= 0
      ? Math.round(forecastData?.mu?.[idxPast] ?? predictedNow)
      : predictedNow;
  const predicted2HoursAhead =
    idxFuture >= 0
      ? Math.round(forecastData?.mu?.[idxFuture] ?? predictedNow)
      : predictedNow;

  // dont touch
  const latestReading = dailyEntries.at(-1);
  const latestReadingAgeMinutes = latestReading
    ? (Date.now() - new Date(latestReading.timestamp).getTime()) / 60000
    : Infinity;
  const bloodGlucoseLevel =
    latestReading && latestReadingAgeMinutes < 60
      ? latestReading.glucose_mg_dl
      : predictedNow;
  // dont touch

  const deltaSugar = bloodGlucoseLevel - predicted2HoursAgo;
  const expectedChange = predicted2HoursAgo - predictedNow;

  const showEntryPanel = dailyEntries.length < MAX_DAILY_ENTRIES;

  const hourlyValues = Array<number | null>(24).fill(null);
  glucoseData.forEach((d) => {
    hourlyValues[d.timestamp.getHours()] = d.value;
  });
  let lastVal = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyValues[i] == null) hourlyValues[i] = lastVal;
    else lastVal = hourlyValues[i]!;
  }

  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    const suffix = i < 12 ? "AM" : "PM";
    return `${h}${suffix}`;
  });

  const chartData = { labels: hourLabels, datasets: [{ data: hourlyValues }] };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingHorizontal: 14, paddingTop: 60 }}>
        <TouchableOpacity
          onLongPress={() => router.push("/(tabs)/account/adminScreen")}
          delayLongPress={1000}
        >
          <Header username={username} icon="LayoutDashboard" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {forecastData ? (
          <DashboardReport
            bloodGlucoseLevel={bloodGlucoseLevel}
            units="mg/dL"
            deltaSugar={deltaSugar}
            expectedChange={expectedChange}
          />
        ) : (
          <Text>Loading... Forecast data is null</Text>
        )}
        <View
          style={{
            height: 300,
            marginBottom: 20,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <ScrollView
            ref={chartScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <GlucoseChart />
          </ScrollView>
        </View>

        <AnimatedDropdown
          label="Blood Sugar Entry"
          placeholder="Select reading type"
          selectedValue={entryContext}
          options={CONTEXT_OPTIONS}
          onSelect={setEntryContext}
          inputLabel="Blood sugar level (mg/dL)"
          inputValue={bloodSugarLvl}
          onChangeText={setBloodSugarLvl}
          theme={theme}
          colorScheme={colorScheme}
          visible={showEntryPanel}
          promptActive={hourlyPrompt}
        />

        {showEntryPanel && (
          <TouchableOpacity
            onPress={onSave}
            style={{
              backgroundColor: theme.tint,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              marginTop: 4,
              opacity: bloodSugarLvl && entryContext ? 1 : 0.45,
            }}
            disabled={!bloodSugarLvl || !entryContext}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Save Reading
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
