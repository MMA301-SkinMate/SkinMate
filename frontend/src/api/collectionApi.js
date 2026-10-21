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
    }

    // saveToCloset: (productId, data = {}) => {
    //     return axiosClient.patch(`/collections/${productId}/status`, {
    //         status: 'active',
    //         ...data
    //     });
    // }
};