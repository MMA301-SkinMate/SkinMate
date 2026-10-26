import axiosClient from './axiosClient';

export const collectionApi = {
    analyzeProduct: (data) => {
        return axiosClient.post('/collections/analyze', data);
    },

    saveDraft: (data) => {
        return axiosClient.post('/collections/draft', data);
    },

    addProduct: (data) => {
        return axiosClient.post('/collections/add', data);
    },

    getScanHistory: (userId) => {
        return axiosClient.get(`/collections/history?userId=${userId || '65b123456789abcdef123456'}`);
    }

    // getCloset: (params = {}) => {
    //     return axiosClient.get('/collections/closet', { params });
    // },

    // moveFromDraft: (id, data = {}) => {
    //     return axiosClient.patch(`/collections/move-from-draft/${id}`, data);
    // },

    // removeProduct: (id, data = {}) => {
    //     return axiosClient.patch(`/collections/remove-product/${id}`, data);
    // },
};