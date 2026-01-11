import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

/**
 * Hook to automatically clear the food log daily at midnight
 * while preserving data in weekly insights
 */
export function useFoodLogCleanup() {
  useEffect(() => {
    checkAndClearDailyLog();
    
    // Check every hour if we need to clear
    const interval = setInterval(checkAndClearDailyLog, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

  const checkAndClearDailyLog = async () => {
    try {
      const lastClearStr = await AsyncStorage.getItem("lastDailyLogClear");
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      today.setHours(0, 0, 0, 0);

      if (lastClearStr) {
        const lastClear = new Date(lastClearStr);
        
        // If last clear was before today, clear the log
        if (lastClear < today) {
          console.log("Clearing daily food log...");
          
          // Load current food log
          const foodLogStr = await AsyncStorage.getItem("foodLog");
          const foodLog = foodLogStr ? JSON.parse(foodLogStr) : [];
          
          // Ensure all entries are in weekly insights before clearing
          if (foodLog.length > 0) {
            const weeklyStr = await AsyncStorage.getItem("weeklyInsightsData");
            const weeklyData = weeklyStr ? JSON.parse(weeklyStr) : [];
            
            // Add any food log entries that aren't already in weekly insights
            const existingIds = new Set(weeklyData.map((entry: any) => entry.id));
            const newEntries = foodLog.filter((entry: any) => !existingIds.has(entry.id));
            
            if (newEntries.length > 0) {
              const updatedWeekly = [...weeklyData, ...newEntries];
              await AsyncStorage.setItem("weeklyInsightsData", JSON.stringify(updatedWeekly));
            }
          }
          
          // Clear the daily food log
          await AsyncStorage.setItem("foodLog", JSON.stringify([]));
          await AsyncStorage.setItem("lastDailyLogClear", today.toISOString());
          
          console.log("Daily food log cleared successfully");
        }
      } else {
        // First time setup
        await AsyncStorage.setItem("lastDailyLogClear", today.toISOString());
      }
    } catch (error) {
      console.error("Error checking daily log clear:", error);
    }
  };

  return { checkAndClearDailyLog };
}