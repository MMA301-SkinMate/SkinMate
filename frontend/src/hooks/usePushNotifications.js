import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { registerPushDevice } from '../api/notificationApi';

const DAILY_CHECK_IN_KIND = 'daily-skin-check-in';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

async function configureAndroidChannel() {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('skin-check-in', {
        name: 'Nhật ký làn da',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
    });
}

async function scheduleDailyCheckIn() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(scheduled
        .filter((item) => item.content?.data?.kind === DAILY_CHECK_IN_KIND)
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)));
    return Notifications.scheduleNotificationAsync({
        content: {
            title: 'Nhật ký làn da',
            body: 'Da bạn hôm nay thế nào? Hãy check-in để SkinMate điều chỉnh routine.',
            data: { kind: DAILY_CHECK_IN_KIND },
            ...(Platform.OS === 'android' ? { channelId: 'skin-check-in' } : {}),
        },
        trigger: { hour: 20, minute: 0, repeats: true },
    });
}

export function usePushNotifications() {
    const navigation = useNavigation();

    useEffect(() => {
        let active = true;
        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            if (response.notification.request.content.data?.kind !== DAILY_CHECK_IN_KIND) return;
            navigation.navigate('MainTabs', { screen: 'Home' });
        });

        const register = async () => {
            if (Platform.OS === 'web' || !Constants.isDevice) return;
            await configureAndroidChannel();
            const existing = await Notifications.getPermissionsAsync();
            const permission = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
            if (permission.status !== 'granted' || !active) return;

            await scheduleDailyCheckIn();
            const projectId = getProjectId();
            if (!projectId) return;
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            if (active && token) await registerPushDevice({ token, platform: Platform.OS });
        };

        register().catch((error) => console.warn('Không thể đăng ký thông báo:', error.message));
        return () => { active = false; subscription.remove(); };
    }, [navigation]);
}
