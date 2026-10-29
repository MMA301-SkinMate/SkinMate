import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    return await axiosClient.post('/auth/login', credentials);
  },
  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  },
  getProfile: async () => {
    return await axiosClient.get('/auth/profile');
  },
  updateProfile: async (data) => {
    return await axiosClient.put('/auth/profile', data);
  },
  getSkinGuide: async () => {
    return await axiosClient.get('/auth/guide');
  },
};

export default authApi;
