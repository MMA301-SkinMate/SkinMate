import axios from 'axios';
import { ENV } from '../constants/env';
import {
    clearStoredSession,
    loadAuthentication,
    saveSession,
} from '../services/authStorage';

let refreshPromise = null;

const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const authentication = await loadAuthentication();
            const refreshToken = authentication.session?.refreshToken;
            if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

            const response = await axios.post(`${ENV.API_URL}/auth/refresh`, { refreshToken });
            const session = await saveSession({
                ...authentication.session,
                ...response.data.data,
                refreshToken,
            });
            return session.accessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};

const axiosClient = axios.create({
    baseURL: ENV.API_URL,
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

        const authentication = await loadAuthentication();
        const accessToken = authentication.session?.accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
    async (error) => {
        const originalRequest = error.config;
        const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh');
        if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest) {
            originalRequest._retry = true;
            try {
                const accessToken = await refreshAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosClient(originalRequest);
            } catch {
                await clearStoredSession();
            }
        }
        if (__DEV__) {
            console.warn(`[API Error] ${error.config?.baseURL}${error.config?.url}:`, error.message, error.response?.status || 'No Response');
        }
        const customError = {
            status: error.response?.status || (error.request ? 0 : 500),
            message:
                error.response?.data?.error?.message ||
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
