import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import {
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  saveAuthSession,
} from '../context/AuthSessionContext';

const resolveBaseUrl = () => {
  if (!__DEV__) {
    return 'https://api.skinmate.com/api';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.replace(/^[a-z]+:\/\//i, '').split(':')[0];
    return `http://${host}:5000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let refreshPromise = null;

function isAuthEndpoint(url = '') {
  const path = url.split('?')[0];
  return ['/auth/login', '/auth/register', '/auth/refresh', '/auth/google/exchange'].some(
    endpoint => path.endsWith(endpoint)
  );
}

async function refreshSession() {
  if (refreshPromise) return refreshPromise;

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

axiosClient.interceptors.request.use(
  config => {
    const accessToken = getAccessToken();
    if (accessToken && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retriedWithFreshToken &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retriedWithFreshToken = true;
      try {
        const session = await refreshSession();
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return axiosClient(originalRequest);
      } catch {
        await clearAuthSession();
      }
    }

    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Internal server error',
      code: error.response?.data?.error?.code || error.response?.data?.code,
    };
    return Promise.reject(customError);
  }
);

export default axiosClient;
