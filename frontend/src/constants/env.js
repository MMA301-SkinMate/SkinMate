
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const resolveBaseUrl = () => {
    if (!__DEV__) {
        return 'https://api.skinmate.com/api';
    }

    // 1. If manualUrl is explicitly defined in .env
    const manualUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (manualUrl && /^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/i.test(manualUrl)) {
        // If 10.0.2.2 is configured, only use it on Android Emulator (iOS will fail on 10.0.2.2)
        const isAndroidEmulatorIp = manualUrl.includes('10.0.2.2');
        if (!isAndroidEmulatorIp || Platform.OS === 'android') {
            return manualUrl.replace(/\/+$/, '');
        }
    }

    // 2. Extract host IP dynamically from Expo (supports iOS, Android & physical devices on Wi-Fi)
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.expoGoConfig?.debuggerHost ||
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.manifest?.debuggerHost;

    if (hostUri) {
        const localIp = hostUri.split(':')[0];
        if (localIp && localIp !== 'localhost' && localIp !== '127.0.0.1') {
            return `http://${localIp}:5000/api`;
        }
    }

    // 3. Fallbacks
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
};



// Expo requires direct process.env.EXPO_PUBLIC_* access to inline these values.
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
