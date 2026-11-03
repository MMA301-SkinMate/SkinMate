import axiosClient from './axiosClient';

export const getCurrentSkinProfile = () => axiosClient.get('/skin-profile/profile');

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

export const getMyRoutine = () => axiosClient.get('/routine/my-routine');
export const getRoutineHistory = () => axiosClient.get('/routine/history');

export const checkCopyCompatibility = (id) => {
    return axiosClient.post(`/routine/${id}/copy/check`);
};

export const executeCopyRoutine = (id, userChoice) => {
    return axiosClient.post(`/routine/${id}/copy`, { userChoice });
};

export const getRoutineSharePreview = (id) => {
    return axiosClient.get(`/routine/${id}/share-preview`);
};
export const getDailyRoutine = () => axiosClient.get('/routines/daily');

export const submitCheckIn = (conditions = []) =>
  axiosClient.post('/routines/daily/checkin', { conditions });

export const undoCheckIn = () =>
  axiosClient.post('/routines/daily/undo');

export const getActivePlan = () => axiosClient.get('/routines/plan/active');

export const getSuggestedPlans = () => axiosClient.get('/routines/plan/suggested');

export const getPlanDetail = (planId) => axiosClient.get(`/routines/plan/${planId}`);

export const activatePlan = (planId) =>
  axiosClient.post(`/routines/plan/${planId}/activate`);

export const updatePlanProduct = (planId, payload) =>
  axiosClient.post(`/routines/plan/${planId}/product`, payload);

export const addPlanDay = (planId, payload) =>
  axiosClient.post(`/routines/plan/${planId}/day`, payload);

export const checkIngredientConflict = (payload) =>
  axiosClient.post('/routines/check-conflict', payload);

export const getExternalRecommendations = (missingIngredients = []) =>
  axiosClient.get('/routines/external-recommendations', {
    params: { missing: missingIngredients.join(',') },
  });

export const triggerCheckInNotification = () =>
  axiosClient.post('/notifications/daily-checkin');

