import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

export type PermissionType = 
  | 'camera' 
  | 'photos' 
  | 'notifications' 
  | 'location';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class PermissionsManager {
  private static instance: PermissionsManager;
  private permissionCache: Map<PermissionType, PermissionStatus> = new Map();

  private constructor() {}

  static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }

  /**
   * Check if a permission has been granted
   */
  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    // Check cache first
    if (this.permissionCache.has(type)) {
      return this.permissionCache.get(type)!;
    }

    let result: PermissionStatus;

    switch (type) {
      case 'camera':
        const cameraStatus = await Camera.getCameraPermissionsAsync();
        result = {
          granted: cameraStatus.granted,
          canAskAgain: cameraStatus.canAskAgain,
          status: cameraStatus.status
        };
        break;

      case 'photos':
        const photosStatus = await ImagePicker.getMediaLibraryPermissionsAsync();
        result = {
          granted: photosStatus.granted,
          canAskAgain: photosStatus.canAskAgain,
          status: photosStatus.status
        };
        break;

      case 'notifications':
        const notifStatus = await Notifications.getPermissionsAsync();
        result = {
          granted: notifStatus.granted,
          canAskAgain: notifStatus.canAskAgain,
          status: notifStatus.status
        };
        break;

      case 'location':
        const locationStatus = await Location.getForegroundPermissionsAsync();
        result = {
          granted: locationStatus.granted,
          canAskAgain: locationStatus.canAskAgain,
          status: locationStatus.status
        };
        break;

      default:
        result = {
          granted: false,
          canAskAgain: false,
          status: 'undetermined'
        };
    }

    this.permissionCache.set(type, result);
    return result;
  }

  /**
   * Request a specific permission with custom UI
   */
  async requestPermission(
    type: PermissionType,
    rationale?: string
  ): Promise<boolean> {
    const currentStatus = await this.checkPermission(type);

    // If already granted, return true
    if (currentStatus.granted) {
      return true;
    }

    // If can't ask again, show settings dialog
    if (!currentStatus.canAskAgain) {
      return await this.showSettingsDialog(type, rationale);
    }

    // Request the permission
    let result: { granted: boolean };

    switch (type) {
      case 'camera':
        result = await Camera.requestCameraPermissionsAsync();
        break;

      case 'photos':
        result = await ImagePicker.requestMediaLibraryPermissionsAsync();
        break;

      case 'notifications':
        result = await Notifications.requestPermissionsAsync();
        break;

      case 'location':
        result = await Location.requestForegroundPermissionsAsync();
        break;

      default:
        result = { granted: false };
    }

    // Update cache
    const newStatus: PermissionStatus = {
      granted: result.granted,
      canAskAgain: true,
      status: result.granted ? 'granted' : 'denied'
    };
    this.permissionCache.set(type, newStatus);

    // Save to storage
    await this.savePermissionStatus(type, result.granted);

    return result.granted;
  }

  /**
   * Show custom dialog to explain permission need
   */
  private async showPermissionRationale(
    type: PermissionType,
    rationale?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const defaultRationales = {
        camera: 'We need camera access to let you take photos of your meals for nutrition tracking.',
        photos: 'We need photo library access to let you choose images for your custom recipes.',
        notifications: 'We need notification permission to remind you about medications and blood sugar readings.',
        location: 'We need location access to provide location-based health insights.'
      };

      const message = rationale || defaultRationales[type];

      Alert.alert(
        `${this.getPermissionName(type)} Permission`,
        message,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Allow',
            onPress: async () => {
              const granted = await this.requestPermission(type);
              resolve(granted);
            }
          }
        ]
      );
    });
  }

  /**
   * Show dialog to open settings when permission is permanently denied
   */
  private async showSettingsDialog(
    type: PermissionType,
    rationale?: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const message = rationale || 
        `${this.getPermissionName(type)} permission has been denied. Please enable it in Settings to use this feature.`;

      Alert.alert(
        'Permission Required',
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            }
          }
        ]
      );
    });
  }

  /**
   * Get user-friendly permission name
   */
  private getPermissionName(type: PermissionType): string {
    const names = {
      camera: 'Camera',
      photos: 'Photo Library',
      notifications: 'Notifications',
      location: 'Location'
    };
    return names[type];
  }

  /**
   * Save permission status to storage
   */
  private async savePermissionStatus(
    type: PermissionType,
    granted: boolean
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `permission_${type}`,
        JSON.stringify({ granted, timestamp: Date.now() })
      );
    } catch (error) {
      console.error('Error saving permission status:', error);
    }
  }

  /**
   * Request all permissions at once (for onboarding)
   */
  async requestAllPermissions(): Promise<{
    [K in PermissionType]: boolean;
  }> {
    const results: { [K in PermissionType]: boolean } = {
      camera: false,
      photos: false,
      notifications: false,
      location: false
    };

    // Request each permission sequentially
    for (const type of Object.keys(results) as PermissionType[]) {
      results[type] = await this.requestPermission(type);
    }

    return results;
  }

  /**
   * Clear permission cache (useful after app settings change)
   */
  clearCache(): void {
    this.permissionCache.clear();
  }
}

export default PermissionsManager.getInstance();