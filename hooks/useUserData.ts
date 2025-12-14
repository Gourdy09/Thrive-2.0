import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface UserData {
  medications: any[];
  settings: any;
  notifications: any;
  // Add other data types as needed
}

const CACHE_KEYS = {
  USER_DATA: "user_data_cache",
  LAST_SYNC: "last_sync_timestamp",
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function useUserData(userId: string | undefined) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      // Try to load from cache first
      const cachedData = await loadFromCache();
      
      if (cachedData) {
        setUserData(cachedData);
        setLoading(false);
        
        // Fetch fresh data in background
        fetchAndCacheData(false);
      } else {
        // No cache, fetch from API
        await fetchAndCacheData(true);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const loadFromCache = async (): Promise<UserData | null> => {
    try {
      const [cachedDataStr, lastSyncStr] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEYS.USER_DATA),
        AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC),
      ]);

      if (!cachedDataStr || !lastSyncStr) {
        return null;
      }

      const lastSync = parseInt(lastSyncStr);
      const now = Date.now();

      // Check if cache is still valid
      if (now - lastSync > CACHE_DURATION) {
        return null;
      }

      return JSON.parse(cachedDataStr);
    } catch (error) {
      console.error("Error loading from cache:", error);
      return null;
    }
  };

  const fetchAndCacheData = async (setLoadingState: boolean) => {
    if (setLoadingState) {
      setLoading(true);
    }

    try {
      // Mock data fetching - replace with Supabase later
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData: UserData = {
        medications: [],
        settings: {
          email: "user@example.com",
          glucoseUnit: "mg/dL",
          timeFormat: "12h",
          theme: "system",
        },
        notifications: {
          bloodSugarAlerts: true,
          medicationAlerts: true,
        },
      };

      // Cache the data
      await Promise.all([
        AsyncStorage.setItem(
          CACHE_KEYS.USER_DATA,
          JSON.stringify(mockData)
        ),
        AsyncStorage.setItem(
          CACHE_KEYS.LAST_SYNC,
          Date.now().toString()
        ),
      ]);

      setUserData(mockData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      if (setLoadingState) {
        setLoading(false);
      }
    }
  };

  const refreshData = async () => {
    await fetchAndCacheData(true);
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.USER_DATA,
        CACHE_KEYS.LAST_SYNC,
      ]);
      setUserData(null);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  return {
    userData,
    loading,
    error,
    refreshData,
    clearCache,
  };
}

/* 
 * When you're ready to implement Supabase, replace the fetchAndCacheData function with:
 * 
 * const fetchAndCacheData = async (setLoadingState: boolean) => {
 *   if (setLoadingState) {
 *     setLoading(true);
 *   }
 * 
 *   try {
 *     const [medicationsResponse, settingsResponse, notificationsResponse] =
 *       await Promise.all([
 *         supabase.from("medications").select("*").eq("user_id", userId),
 *         supabase.from("settings").select("*").eq("user_id", userId).single(),
 *         supabase.from("notifications").select("*").eq("user_id", userId).single(),
 *       ]);
 * 
 *     const freshData: UserData = {
 *       medications: medicationsResponse.data || [],
 *       settings: settingsResponse.data || {},
 *       notifications: notificationsResponse.data || {},
 *     };
 * 
 *     await Promise.all([
 *       AsyncStorage.setItem(CACHE_KEYS.USER_DATA, JSON.stringify(freshData)),
 *       AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString()),
 *     ]);
 * 
 *     setUserData(freshData);
 *     setError(null);
 *   } catch (err) {
 *     console.error("Error fetching data:", err);
 *     setError("Failed to fetch data");
 *   } finally {
 *     if (setLoadingState) {
 *       setLoading(false);
 *     }
 *   }
 * };
 */