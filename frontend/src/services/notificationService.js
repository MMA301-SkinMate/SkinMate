import { Platform } from 'react-native';
import routineApi from '../api/routineApi';

/**
 * 12. Quản lý thông báo check-in da hàng ngày
 * Lên lịch thông báo về thiết bị user để nhắc check-in làn da
 */
class NotificationService {
  constructor() {
    this.notificationsModule = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      // Dynamic import expo-notifications if available in the environment
      const ExpoNotifications = await import('expo-notifications').catch(() => null);
      if (ExpoNotifications) {
        this.notificationsModule = ExpoNotifications;
        ExpoNotifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }
    } catch {
      // Notifications module not installed or running in unsupported env
    }
    this.isInitialized = true;
  }

  async requestPermission() {
    await this.init();
    if (!this.notificationsModule) return false;
    try {
      const { status: existingStatus } = await this.notificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await this.notificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Lên lịch thông báo nhắc check-in sáng (08:00) và tối (20:00)
   */
  async scheduleDailyCheckinReminders({ morningTime = '08:00', eveningTime = '20:00', isEnabled = true }) {
    await this.init();

    // Đồng bộ lên backend database
    try {
      await routineApi.updateNotificationSettings({
        isEnabled,
        morningTime,
        eveningTime,
      });
    } catch (e) {
      console.warn('Không thể đồng bộ cài đặt thông báo lên server:', e.message);
    }

    if (!this.notificationsModule || !isEnabled) {
      if (this.notificationsModule) {
        await this.notificationsModule.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
      return { success: true, scheduled: false };
    }

    const granted = await this.requestPermission();
    if (!granted) {
      return { success: false, message: 'Chưa cấp quyền thông báo' };
    }

    // Hủy các thông báo cũ trước khi tạo lịch mới
    await this.notificationsModule.cancelAllScheduledNotificationsAsync().catch(() => {});

    // Parse giờ sáng
    const [mHour, mMinute] = morningTime.split(':').map(Number);
    // Parse giờ tối
    const [eHour, eMinute] = eveningTime.split(':').map(Number);

    try {
      // 1. Nhắc checkin buổi sáng
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: '☀️ Chào buổi sáng! Nhật ký làn da',
          body: 'Da bạn sáng nay thế nào? Hãy check-in 10s để SkinMate điều chỉnh chu trình skincare hôm nay nhé!',
          data: { screen: 'Home', action: 'checkin' },
        },
        trigger: {
          hour: mHour,
          minute: mMinute,
          repeats: true,
        },
      });

      // 2. Nhắc checkin buổi tối
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: '🌙 SkinMate: Đã đến giờ Skincare buổi tối',
          body: 'Check-in tình trạng da hôm nay để nhận danh sách các bước dưỡng phục hồi tối nay nha.',
          data: { screen: 'Home', action: 'checkin' },
        },
        trigger: {
          hour: eHour,
          minute: eMinute,
          repeats: true,
        },
      });

      return { success: true, scheduled: true };
    } catch (error) {
      console.warn('Lỗi khi lên lịch thông báo cục bộ:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
