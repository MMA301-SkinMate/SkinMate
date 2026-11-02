import axiosClient from './axiosClient';

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

