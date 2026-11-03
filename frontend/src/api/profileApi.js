import axiosClient from './axiosClient';

const unwrap = (response) => response?.data !== undefined ? response.data : response;

export const profileApi = {
  get: () => axiosClient.get('/profile').then(unwrap),
  updateAccount: (payload) => axiosClient.patch('/profile', payload).then(unwrap),
  changePassword: (payload) => axiosClient.post('/profile/change-password', payload).then(unwrap),
  resetSkinProfile: (payload) => axiosClient.post('/profile/skin-profile', payload).then(unwrap),
};

export default profileApi;
