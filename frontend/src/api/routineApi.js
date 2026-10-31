import axiosClient from './axiosClient';

export const getSkinGuide = (skinType, allergies = []) => {
    const params = {};
    if (skinType) params.skinType = skinType;
    if (allergies.length > 0) params.allergies = allergies.join(',');
    return axiosClient.get('/routine/guide', { params });
};

export const suggestRoutine = () => {
    return axiosClient.post('/routine/suggest');
};

export const getRoutineDetail = (id) => {
    return axiosClient.get(`/routine/${id}`);
};

export const activateRoutine = (id) => {
    return axiosClient.post(`/routine/${id}/activate`);
};

export const dismissRoutine = (id) => {
    return axiosClient.post(`/routine/${id}/dismiss`);
};

export const updateSkinProfile = (payload) => {
    return axiosClient.put('/routine/skin-profile', payload);
};

export const getRoutineHistory = () => {
    return axiosClient.get('/routine/history');
};

export const checkCopyCompatibility = (id) => {
    return axiosClient.post(`/routine/${id}/copy/check`);
};

export const executeCopyRoutine = (id, userChoice) => {
    return axiosClient.post(`/routine/${id}/copy`, { userChoice });
};

export const getRoutineSharePreview = (id) => {
    return axiosClient.get(`/routine/${id}/share-preview`);
};
