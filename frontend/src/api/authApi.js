import axiosClient from './axiosClient';

export const register = payload => axiosClient.post('/auth/register', payload);
export const login = payload => axiosClient.post('/auth/login', payload);
export const refresh = refreshToken => axiosClient.post('/auth/refresh', { refreshToken });
export const logout = refreshToken => axiosClient.post('/auth/logout', { refreshToken });
export const requestPasswordReset = email => axiosClient.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => axiosClient.post('/auth/reset-password', { token, password });
export const exchangeGoogleCode = code => axiosClient.post('/auth/google/exchange', { code });

export const getGoogleAuthorizationUrl = () => {
  const baseUrl = axiosClient.defaults.baseURL.replace(/\/api$/, '');
  return `${baseUrl}/api/auth/google`;
};
