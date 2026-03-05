import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
// Todo (bluetooth): uncomment these when the pipeline is wired up
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAuth } from "@/contexts/AuthContext";

// TODO(bluetooth): restore these once sequences flow from bluetooth → preprocessing
// const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";
// const DAYS_KEY   = "onboarding_start_date";
// const WINDOW_KEY = "optimized_window";

export interface ForecastData {
  timePoints: number[];
  trajectory: number[]; // raw G̃_t (debug, dashed line)
  mu: number[]; // windowed mean — primary signal
  lower: number[]; // μ - Δ
  upper: number[]; // μ + Δ
  sigma: number[];
  windowMinutes: number;
}

interface ForecastState {
  data: ForecastData | null;
  loading: boolean;
  error: string | null;
}

// TODO(bluetooth): uncomment when real data is available
// function daysSinceStart(startIso: string): number {
//   const start = new Date(startIso).getTime();
//   return Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24));
// }

//  mock data
// Represents a typical glucose day: fasting → breakfast spike → lunch → dinner
const MOCK_MU: number[] = [
  90,
  88,
  87,
  86,
  88,
  91, // 0–5 AM   sleep / dawn rise
  95,
  138,
  155,
  140,
  118,
  102, // 6–11 AM  breakfast
  98,
  142,
  152,
  135,
  112,
  99, // 12–5 PM  lunch
  95,
  158,
  162,
  145,
  118,
  97, // 6–11 PM  dinner
];
const MOCK_NOISE = [
  3, -4, 2, -3, 5, -2, 4, -5, 6, -4, 3, -2, 5, -3, 4, -5, 2, -4, 6, -3, 5, -4,
  3, -2,
];
const MOCK_DATA: ForecastData = {
  timePoints: Array.from({ length: 24 }, (_, i) => i),
  trajectory: MOCK_MU.map((v, i) => v + MOCK_NOISE[i]),
  mu: MOCK_MU,
  lower: MOCK_MU.map((v) => v - 14),
  upper: MOCK_MU.map((v) => v + 14),
  sigma: Array.from({ length: 24 }, () => 7),
  windowMinutes: 60,
};

// todo (bluetooth): when the pipeline is ready, restore the full signature:
//
// export function useGlucoseForecast(
//   sequences?:     any[],   // meal_features from sequences_to_dict
//   sensorWindows?: any[],   // sensor_windows from sequences_to_dict
// ): ForecastState & { refresh: () => void }
//
// And replace the hook body with the real fetch implementation below.

export function useGlucoseForecast(): ForecastState & { refresh: () => void } {
  // todo (bluetooth): restore these
  // const { user } = useAuth();
  // const sequencesRef     = useRef(sequences);
  // const sensorWindowsRef = useRef(sensorWindows);
  // sequencesRef.current     = sequences;
  // sensorWindowsRef.current = sensorWindows;

  const [state] = useState<ForecastState>({
    data: MOCK_DATA, // start as null and fetch below
    loading: false,
    error: null,
  });

  // replace this no-op with the real fetch:
  //
  // const fetchForecast = useCallback(async () => {
  //   const seqs = sequencesRef.current;
  //   const wins = sensorWindowsRef.current;
  //
  //   if (!seqs?.length) {
  //     setState(prev => prev.data ? prev : { data: MOCK_DATA, loading: false, error: null });
  //     return;
  //   }
  //
  //   setState(prev => ({ ...prev, loading: true, error: null }));
  //   try {
  //     const startIso        = await AsyncStorage.getItem(DAYS_KEY);
  //     const days            = startIso ? daysSinceStart(startIso) : 0;
  //     const optimizedWinRaw = await AsyncStorage.getItem(WINDOW_KEY);
  //     const optimizedWindow = optimizedWinRaw ? parseInt(optimizedWinRaw, 10) : null;
  //
  //     const res = await fetch(`${API_BASE}/simulate-glucose`, {
  //       method:  "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         userID:          user?.id,
  //         sequences:       seqs,
  //         sensorWindows:   wins,
  //         daysSinceStart:  days,
  //         optimizedWindow,
  //       }),
  //     });
  //
  //     if (!res.ok) {
  //       const err = await res.json();
  //       throw new Error(err.error ?? `HTTP ${res.status}`);
  //     }
  //
  //     const data: ForecastData = await res.json();
  //     setState({ data, loading: false, error: null });
  //   } catch (e: any) {
  //     setState(prev => ({ ...prev, loading: false, error: e.message ?? "Forecast failed" }));
  //   }
  // }, [user?.id]);   // array props intentionally read via ref, not in deps
  //
  // useFocusEffect(useCallback(() => { fetchForecast(); }, [fetchForecast]));
  // return { ...state, refresh: fetchForecast };

  const refresh = useCallback(() => {}, []);
  useFocusEffect(useCallback(() => {}, []));
  return { ...state, refresh };
}
