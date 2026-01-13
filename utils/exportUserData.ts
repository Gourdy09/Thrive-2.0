import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const BLOOD_SUGAR_STORAGE_KEY = '@thrive_blood_sugar_data';
const DEFAULT_MAX_STORAGE_SIZE = 1024 * 1024; // 1MB in bytes
const STORAGE_SIZE_KEY = '@thrive_blood_sugar_max_size';

interface BloodSugarReading {
  value: number;
  timestamp: string;
  unit: 'mg/dL' | 'mmol/L';
  notes?: string;
  mealContext?: 'fasting' | 'before_meal' | 'after_meal' | 'bedtime';
}

interface ExportData {
  exportDate: string;
  user: {
    id: string;
    email: string | undefined;
    createdAt: string | undefined;
  };
  bloodSugarReadings?: BloodSugarReading[];
  bloodSugarStats?: {
    totalReadings: number;
    oldestReading: string;
    newestReading: string;
    storageUsed: number;
    storageLimit: number;
  };
  settings?: {
    glucoseUnit: string;
    timeFormat: string;
    theme: string;
    you: {
      name: string;
      age: number;
      birthdate: number;
      gender: string;
      race: string;
      diabetesType: string;
      baselineGlucose: number;
      height: number;
      weight: number;
      activityLevel: string;
      dietaryRestrictions: string[];
    };
  };
  devices?: any[];
  medications?: any[];
  medicationReminders?: any[];
  foodLog?: any[];
  recipes?: any[];
  glucoseReadings?: any[];
  notifications?: any;
  subscriptions?: any;
  paymentMethods?: any[];
}

/**
 * Calculate size of data in bytes
 */
function calculateSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

/**
 * Get current storage size limit
 */
async function getStorageSizeLimit(): Promise<number> {
  try {
    const limit = await AsyncStorage.getItem(STORAGE_SIZE_KEY);
    return limit ? parseInt(limit, 10) : DEFAULT_MAX_STORAGE_SIZE;
  } catch (error) {
    console.error('Error getting storage limit:', error);
    return DEFAULT_MAX_STORAGE_SIZE;
  }
}

/**
 * Get all blood sugar readings from local storage (chart data)
 */
async function getBloodSugarReadings(): Promise<BloodSugarReading[]> {
  try {
    const data = await AsyncStorage.getItem(BLOOD_SUGAR_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting blood sugar readings:', error);
    return [];
  }
}

/**
 * Get blood sugar statistics
 */
async function getBloodSugarStats() {
  try {
    const readings = await getBloodSugarReadings();
    const storageLimit = await getStorageSizeLimit();
    const storageUsed = calculateSize(readings);
    
    if (readings.length === 0) {
      return {
        totalReadings: 0,
        storageUsed: 0,
        storageLimit,
        oldestReading: '',
        newestReading: '',
      };
    }
    
    const sorted = [...readings].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      totalReadings: readings.length,
      storageUsed,
      storageLimit,
      oldestReading: sorted[0].timestamp,
      newestReading: sorted[sorted.length - 1].timestamp,
    };
  } catch (error) {
    console.error('Error getting blood sugar stats:', error);
    return null;
  }
}

/**
 * Fetches all user data from chart data (local storage) and Supabase
 * All blood sugar data comes from the local chart storage
 */
async function fetchAllUserData(userId: string): Promise<ExportData> {
  try {
    // Get user info
    const { data: userData } = await supabase.auth.getUser();
    
    // Get blood sugar readings from LOCAL STORAGE (chart data)
    const bloodSugarReadings = await getBloodSugarReadings();
    const bloodSugarStats = await getBloodSugarStats();
    
    // Fetch user_info (all settings data)
    const { data: userInfo } = await supabase
      .from('user_info')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Fetch dietary restrictions
    const { data: dietaryRestrictions } = await supabase
      .from('dietaryRestrictions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch connected devices
    const { data: devices } = await supabase
      .from('connected_devices')
      .select('*')
      .eq('user_id', userId);

    // Fetch medications
    const { data: medications } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId);

    // Fetch medication reminders/alarms
    const { data: medicationReminders } = await supabase
      .from('medication_reminders')
      .select('*')
      .eq('user_id', userId);

    // Fetch food log entries
    const { data: foodLog } = await supabase
      .from('food_log')
      .select('*')
      .eq('user_id', userId);

    // Fetch saved recipes
    const { data: recipes } = await supabase
      .from('saved_recipes')
      .select('*')
      .eq('user_id', userId);

    // Fetch glucose readings (if stored in Supabase as well)
    const { data: glucoseReadings } = await supabase
      .from('glucose_readings')
      .select('*')
      .eq('user_id', userId);

    // Fetch notification preferences
    const { data: notificationPreferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch subscription information
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch payment methods
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);

    return {
      exportDate: new Date().toISOString(),
      user: {
        id: userId,
        email: userData.user?.email,
        createdAt: userData.user?.created_at,
      },
      // All blood sugar data comes from local storage (the chart)
      bloodSugarReadings: bloodSugarReadings.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ), // Newest first in export
      bloodSugarStats: bloodSugarStats ? {
        totalReadings: bloodSugarStats.totalReadings,
        oldestReading: bloodSugarStats.oldestReading || '',
        newestReading: bloodSugarStats.newestReading || '',
        storageUsed: bloodSugarStats.storageUsed,
        storageLimit: bloodSugarStats.storageLimit,
      } : undefined,
      // Settings data (from user_info table)
      settings: userInfo ? {
        glucoseUnit: userInfo.glucoseunit,
        timeFormat: userInfo.timeformat,
        theme: userInfo.theme,
        you: {
          name: userInfo.name,
          age: userInfo.age,
          birthdate: userInfo.bday,
          gender: userInfo.gender,
          race: userInfo.race,
          diabetesType: userInfo.diabetes,
          baselineGlucose: userInfo.baselinebloodglucose,
          height: userInfo.height,
          weight: userInfo.weight,
          activityLevel: userInfo.activitylevel,
          dietaryRestrictions: dietaryRestrictions?.restrictions || [],
        },
      } : undefined,
      // Connected devices
      devices: devices?.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        serialNumber: d.serialnumber,
        batteryLevel: d.batteryLevel,
        lastSync: d.lastsync,
        isConnected: d.isconnected,
        isActive: d.isactive,
      })) || [],
      // Medications
      medications: medications || [],
      medicationReminders: medicationReminders || [],
      // Food data
      foodLog: foodLog || [],
      recipes: recipes || [],
      // Glucose readings (if also stored in Supabase)
      glucoseReadings: glucoseReadings || [],
      // Notifications
      notifications: notificationPreferences || undefined,
      // Subscriptions & Payments
      subscriptions: subscriptions || undefined,
      paymentMethods: paymentMethods || [],
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Saves file to device on Android using Storage Access Framework
 */
async function saveFileAndroid(fileUri: string, filename: string): Promise<void> {
  try {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    
    if (!permissions.granted) {
      await Sharing.shareAsync(fileUri);
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await FileSystem.StorageAccessFramework.createFileAsync(
      permissions.directoryUri,
      filename,
      'application/json'
    )
      .then(async (uri) => {
        await FileSystem.writeAsStringAsync(uri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Alert.alert('Success', 'Your data has been exported successfully!');
      })
      .catch((e) => {
        console.error('Error creating file:', e);
        throw e;
      });
  } catch (error) {
    console.error('Error saving file on Android:', error);
    throw error;
  }
}

/**
 * Main export function that handles the entire export process
 * 
 * @param maxStorageSizeMB - Optional: Set the maximum storage size for blood sugar data in MB (default: 1MB)
 * 
 * Usage:
 * - exportUserData() // Uses default 1MB limit
 * - exportUserData(2) // Sets 2MB limit before export
 * - exportUserData(0.5) // Sets 500KB limit before export
 */
export async function exportUserData(maxStorageSizeMB?: number): Promise<void> {
  try {
    // Update storage limit if provided
    if (maxStorageSizeMB !== undefined) {
      const sizeInBytes = Math.floor(maxStorageSizeMB * 1024 * 1024);
      await AsyncStorage.setItem(STORAGE_SIZE_KEY, sizeInBytes.toString());
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to export data');
      return;
    }

    // Show loading indicator
    Alert.alert('Exporting Data', 'Please wait while we gather your data...');

    // Fetch all user data (blood sugar data comes from local storage/chart)
    const userData = await fetchAllUserData(user.id);

    // Convert to formatted JSON
    const jsonData = JSON.stringify(userData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `thrive-data-export-${timestamp}.json`;

    // Create file URI
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write JSON to file
    await FileSystem.writeAsStringAsync(fileUri, jsonData, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Handle platform-specific saving
    if (Platform.OS === 'android') {
      await saveFileAndroid(fileUri, filename);
    } else {
      // iOS - use sharing dialog
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          UTI: 'public.json',
          dialogTitle: 'Save your Thrive data export',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error exporting user data:', error);
    Alert.alert(
      'Export Failed',
      'There was an error exporting your data. Please try again.'
    );
  }
}