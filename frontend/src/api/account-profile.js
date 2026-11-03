import axiosClient from './axiosClient';

export const getAccountProfile = () => axiosClient.get('/account/profile');
export const saveAccountProfile = ({ fullName, phoneNumber, avatar }) => {
  const data = new FormData();
  data.append('fullName', fullName.trim());
  data.append('phoneNumber', phoneNumber.trim());
  if (avatar) {
    const type = avatar.mimeType || 'image/jpeg';
    const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    data.append('avatar', { uri: avatar.uri, name: `avatar.${extension}`, type });
  }
  return axiosClient.patch('/account/profile', data, { timeout: 45000 });
};
