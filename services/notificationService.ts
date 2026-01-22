// services/notificationService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  categoryIdentifier?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permissions from user
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    // Store permission status
    await AsyncStorage.setItem('notification_permission', finalStatus);
    
    return finalStatus === 'granted';
  }

  /**
   * Get Expo push token for remote notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      
      // Save token to AsyncStorage and/or Supabase
      await AsyncStorage.setItem('expo_push_token', token);
      
      console.log('Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    notification: NotificationPayload,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  }

  /**
   * Schedule medication reminder
   */
  async scheduleMedicationReminder(
    medicationName: string,
    dosage: string,
    time: Date,
    repeatDaily: boolean = true
  ): Promise<string> {
    const trigger: Notifications.NotificationTriggerInput = repeatDaily
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          repeats: true,
          hour: time.getHours(),
          minute: time.getMinutes(),
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
        };

    return await this.scheduleNotification(
      {
        title: '💊 Time for your medication',
        body: `${medicationName} - ${dosage}`,
        data: { type: 'medication', medicationName },
        categoryIdentifier: 'medication',
      },
      trigger
    );
  }

  /**
   * Schedule blood sugar alert
   */
  async scheduleBloodSugarAlert(
    level: number,
    threshold: 'high' | 'low'
  ): Promise<string> {
    const message = threshold === 'high'
      ? `Blood sugar is high: ${level} mg/dL`
      : `Blood sugar is low: ${level} mg/dL`;

    return await this.scheduleNotification(
      {
        title: '⚠️ Blood Sugar Alert',
        body: message,
        data: { type: 'blood_sugar', level, threshold },
      },
      { 
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1 
      }
    );
  }

  /**
   * Schedule payment reminder
   */
  async schedulePaymentReminder(
    type: 'upcoming' | 'due' | 'failed',
    amount: number,
    dueDate: Date
  ): Promise<string> {
    let title = '';
    let body = '';

    switch (type) {
      case 'upcoming':
        title = '💳 Payment Reminder';
        body = `Your payment of ${amount.toFixed(2)} is due in 3 days`;
        break;
      case 'due':
        title = '💳 Payment Due Today';
        body = `Your payment of ${amount.toFixed(2)} is due today`;
        break;
      case 'failed':
        title = '❌ Payment Failed';
        body = `Your payment of ${amount.toFixed(2)} was declined. Please update your payment method.`;
        break;
    }

    const trigger: Notifications.NotificationTriggerInput = type === 'failed' 
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate
        };

    return await this.scheduleNotification(
      {
        title,
        body,
        data: { type: 'payment', amount, dueDate: dueDate.toISOString() },
      },
      trigger
    );
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Add notification received listener (when app is in foreground)
   */
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export default NotificationService.getInstance();