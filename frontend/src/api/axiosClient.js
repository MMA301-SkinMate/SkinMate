import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const resolveBaseUrl = () => {
    // Production environment configuration
    if (!__DEV__) {
        return 'https://api.skinmate.com/api';
    }

    // Development environment configuration:
    // Extract local host IP dynamically from Expo (supports both Android & iOS physical devices via Expo Go)
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants.expoGoConfig?.debuggerHost ||
        Constants.manifest2?.extra?.expoGo?.debuggerHost ||
        Constants.manifest?.debuggerHost;

    if (hostUri) {
        const localIp = hostUri.split(':')[0];
        return `http://${localIp}:5000/api`;
    }

    // Fallback for Android Emulator
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:5000/api';
    }

    // Fallback for iOS Simulator and Web
    return 'http://localhost:5000/api';
};

const axiosClient = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 90000,
    transformRequest: [
        (data, headers) => {
            const isFormData =
                data instanceof FormData ||
                (data && typeof data.append === 'function') ||
                (data && Boolean(data?._parts));

            if (isFormData) {
                // Ensure Axios does not serialize FormData to JSON
                // Remove Content-Type so React Native's XMLHttpRequest sets multipart boundary automatically
                if (headers) {
                    delete headers['Content-Type'];
                    delete headers['content-type'];
                    if (headers.delete) {
                        headers.delete('Content-Type');
                        headers.delete('content-type');
                    }
                }
                return data;
            }

            if (typeof data === 'object' && data !== null) {
                return JSON.stringify(data);
            }
            return data;
        },
    ],
});

axiosClient.interceptors.request.use(
    async (config) => {
        if (config.url) {
            if (config.url.startsWith('/api/')) {
                config.url = config.url.replace(/^\/api/, '');
            } else if (config.url.startsWith('api/')) {
                config.url = config.url.replace(/^api/, '');
            }
        }

        const isFormData =
            config.data instanceof FormData ||
            (config.data && typeof config.data.append === 'function') ||
            (config.data && Boolean(config.data?._parts));

        if (isFormData) {
            delete config.headers['Content-Type'];
            delete config.headers['content-type'];
            if (config.headers?.delete) {
                config.headers.delete('Content-Type');
                config.headers.delete('content-type');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const customError = {
            status: error.response?.status || (error.request ? 0 : 500),
            message:
                error.response?.data?.message ||
                (error.code === 'ECONNABORTED' ? 'Request timeout. Server took too long to respond.' : null) ||
                error.message ||
                'Network connection error. Please check if your backend is running.',
            data: error.response?.data,
            isNetworkError: !error.response && Boolean(error.request),
        };
        return Promise.reject(customError);
    }
);

export default axiosClient;