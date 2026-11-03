import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  // Graceful fallback for non-supported environments
}

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Notification permission error:', error?.message);
    return false;
  }
}

export async function scheduleDailyCheckInReminder(hour = 8, minute = 0) {
  if (Platform.OS === 'web') return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    // Cancel previous check-in reminders first
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Nhật ký làn da hôm nay - SkinMate',
        body: 'Da bạn hôm nay thế nào? Hãy check-in để SkinMate tự động điều chỉnh chu trình skincare tối ưu nhé!',
        data: { screen: 'Home', type: 'daily_checkin' },
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
  } catch (err) {
    console.warn('scheduleDailyCheckInReminder error:', err?.message);
  }
}

export async function sendImmediateCheckInReminder() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌟 Nhật ký làn da - SkinMate',
        body: 'Hôm nay da bạn thế nào? Hãy check-in để SkinMate điều chỉnh chu trình skincare nhé!',
        data: { screen: 'Home', type: 'daily_checkin' },
        sound: true,
      },
      trigger: null, // triggers immediately
    });
  } catch (err) {
    console.warn('sendImmediateCheckInReminder error:', err?.message);
  }
}

export async function cancelAllReminders() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('cancelAllReminders error:', err?.message);
  }
}

