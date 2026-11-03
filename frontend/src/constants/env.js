import Constants from 'expo-constants';
import { Platform } from 'react-native';

const resolveBaseUrl = () => {
    if (!__DEV__) {
        return 'https://api.skinmate.com/api';
    }

    // 1. Trích xuất IP động từ Expo (tự động nhận IP máy chạy Metro, hỗ trợ cả máy thật, iOS và Android)
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.expoGoConfig?.debuggerHost ||
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.manifest?.debuggerHost;

    const localIp = hostUri ? hostUri.split(':')[0] : null;

    // 2. Kiểm tra biến EXPO_PUBLIC_API_URL từ file .env
    const manualUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

    // Tự động thay thế placeholder [IP_ADDRESS] bằng IP động từ máy
    if (manualUrl && manualUrl.includes('[IP_ADDRESS]')) {
        const targetIp = (localIp && localIp !== 'localhost' && localIp !== '127.0.0.1')
            ? localIp
            : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
        return manualUrl.replace('[IP_ADDRESS]', `${targetIp}:5000`).replace(/\/+$/, '');
    }

    if (manualUrl && /^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/i.test(manualUrl)) {
        const isAndroidEmulatorIp = manualUrl.includes('10.0.2.2');
        if (!isAndroidEmulatorIp || Platform.OS === 'android') {
            return manualUrl.replace(/\/+$/, '');
        }
    }

    // 3. Nếu lấy được IP động từ Expo
    if (localIp && localIp !== 'localhost' && localIp !== '127.0.0.1') {
        return `http://${localIp}:5000/api`;
    }

    // 4. Fallbacks
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
};

const apiUrl = resolveBaseUrl();
const mockApiFlag = process.env.EXPO_PUBLIC_USE_MOCK_API?.trim() || 'false';
const previewFlag = process.env.EXPO_PUBLIC_SHOW_COMPONENT_PREVIEW?.trim() || 'false';

if (!apiUrl || !/^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/i.test(apiUrl)) {
    throw new Error(
        'Set EXPO_PUBLIC_API_URL to an HTTP(S) API URL in frontend/.env. Copy .env.example to .env to get started.'
    );
}

if (mockApiFlag !== 'true' && mockApiFlag !== 'false') {
    throw new Error('EXPO_PUBLIC_USE_MOCK_API must be true or false in frontend/.env.');
}

if (previewFlag !== 'true' && previewFlag !== 'false') {
    throw new Error('EXPO_PUBLIC_SHOW_COMPONENT_PREVIEW must be true or false in frontend/.env.');
}

export const ENV = Object.freeze({
    API_URL: apiUrl.replace(/\/+$/, ''),
    USE_MOCK_API: mockApiFlag === 'true',
    SHOW_COMPONENT_PREVIEW: previewFlag === 'true',
});
