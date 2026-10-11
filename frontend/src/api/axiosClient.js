import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const resolveBaseUrl = () => {

    // Production environment configuration
    if (!__DEV__) {
        return 'https://api.skinmate.com/api';
    }

    // Development environment configuration
    if (Platform.OS === 'android') {
        // Automatically retrieve the local IP address from Expo hostUri during development
        const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
        if (hostUri) {
            const localIp = hostUri.split(':')[0];
            return `http://${localIp}:5000/api`;
        }
        // Fallback for Android Emulator if hostUri is unavailable
        return 'http://10.0.2.2:5000/api';
    }

    // iOS Simulator and Web environment
    return 'http://localhost:5000/api';
};

const axiosClient = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

axiosClient.interceptors.request.use(
    async (config) => {
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
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message || 'Internal server error',
        };
        return Promise.reject(customError);
    }
);

export default axiosClient;