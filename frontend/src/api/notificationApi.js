import axiosClient from './axiosClient';

export const registerPushDevice = payload => axiosClient.post('/notifications/devices', payload);
export const unregisterPushDevice = token => axiosClient.delete('/notifications/devices', { data: { token } });
