
import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  saveAuthSession,
} from '../context/AuthSessionContext';

// ========================================
// 1. RESOLVE API BASE URL
// ========================================
const resolveBaseUrl = () => {
  if (!__DEV__) {
    return 'https://api.skinmate.com/api';
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    try {
      const normalizedHost = hostUri.includes('://')
        ? hostUri
        : `http://${hostUri}`;

      const hostname = new URL(normalizedHost).hostname;

      // Tunnel URLs cannot be used as local backend IPs.
      if (
        hostname &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        !hostname.endsWith('.exp.direct')
      ) {
        const formattedHost = hostname.includes(':')
          ? `[${hostname}]`
          : hostname;

        return `http://${formattedHost}:5000/api`;
      }
    } catch (error) {
      console.warn('Unable to resolve Expo host:', error);
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

// ========================================
// 2. CREATE AXIOS INSTANCE
// ========================================
const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000,
});

// ========================================
// 3. AUTH HELPERS
// ========================================
let refreshPromise = null;

function isAuthEndpoint(url = '') {
  const path = url.split('?')[0];

  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/google/exchange',
  ].some(endpoint => path.endsWith(endpoint));
}

async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const session = getAuthSession();

    if (!session?.refreshToken) {
      throw new Error('No refresh token is available');
    }

    const authResult = await axiosClient.post('/auth/refresh', {
      refreshToken: session.refreshToken,
    });

    return saveAuthSession(authResult);
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ========================================
// 4. REQUEST INTERCEPTOR
// ========================================
axiosClient.interceptors.request.use(
  config => {
    // Normalize /api prefix.
    if (typeof config.url === 'string') {
      if (config.url.startsWith('/api/')) {
        config.url = config.url.slice(4);
      } else if (config.url.startsWith('api/')) {
        config.url = `/${config.url.slice(4)}`;
      }

      // Ensure relative endpoint paths work
      // consistently with the /api base URL.
      if (
        !/^https?:\/\//i.test(config.url) &&
        !config.url.startsWith('/')
      ) {
        config.url = `/${config.url}`;
      }
    }

    // Handle file/image uploads.
    const data = config.data;

    const isFormData =
      (typeof FormData !== 'undefined' &&
        data instanceof FormData) ||
      (data && typeof data.append === 'function') ||
      (data && Array.isArray(data._parts));

    if (isFormData) {
      // Allow Axios/native adapter to set
      // multipart/form-data and boundary.
      if (config.headers?.delete) {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    // Attach access token.
    const accessToken = getAccessToken();

    if (accessToken && !isAuthEndpoint(config.url)) {
      config.headers.set(
        'Authorization',
        `Bearer ${accessToken}`
      );
    }

    return config;
  },
  error => Promise.reject(error)
);

// ========================================
// 5. RESPONSE INTERCEPTOR
// ========================================
axiosClient.interceptors.response.use(
  response => response.data,

  async error => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;

    // Automatically refresh expired access token.
    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retriedWithFreshToken &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retriedWithFreshToken = true;

      try {
        const session = await refreshSession();

        if (!session?.accessToken) {
          throw new Error('Failed to refresh access token');
        }

        originalRequest.headers.set(
          'Authorization',
          `Bearer ${session.accessToken}`
        );

        return await axiosClient(originalRequest);
      } catch (refreshError) {
        await clearAuthSession();
      }
    }

    // Normalize API/network errors.
    const isNetworkError =
      !error.response && Boolean(error.request);

    const isTimeout =
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT';

    const customError = {
      status: error.response?.status || (isNetworkError ? 0 : 500),

      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        (isTimeout
          ? 'Request timeout. Server took too long to respond.'
          : null) ||
        (isNetworkError
          ? 'Network connection error. Please check if your backend is running.'
          : null) ||
        error.message ||
        'Internal server error',

      code:
        error.response?.data?.error?.code ||
        error.response?.data?.code ||
        error.code,

      data: error.response?.data,

      isNetworkError,
    };

    return Promise.reject(customError);
  }
);

// ========================================
// 6. EXPORT
// ========================================
export default axiosClient;
