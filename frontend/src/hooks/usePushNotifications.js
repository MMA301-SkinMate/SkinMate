// import { useEffect } from 'react';
// import { Platform } from 'react-native';
// import Constants from 'expo-constants';
// import * as Notifications from 'expo-notifications';
// import { registerPushDevice } from '../api/notificationApi';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
// });

// const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;

// export function usePushNotifications() {
//   useEffect(() => {
//     let active = true;

//     const register = async () => {
//       if (Platform.OS === 'web' || !Constants.isDevice) return;
//       const existing = await Notifications.getPermissionsAsync();
//       const permission = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
//       if (permission.status !== 'granted') return;

//       const options = getProjectId() ? { projectId: getProjectId() } : undefined;
//       const token = (await Notifications.getExpoPushTokenAsync(options)).data;
//       if (active) await registerPushDevice({ token, platform: Platform.OS });
//     };

//     register().catch(error => console.warn('Không thể đăng ký thông báo:', error.message));
//     return () => { active = false; };
//   }, []);
// }
