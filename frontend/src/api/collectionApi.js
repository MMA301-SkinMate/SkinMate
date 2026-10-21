import axiosClient from './axiosClient';

export const collectionApi = {
    analyzeProduct: (data) => {
        return axiosClient.post('/collections/analyze', data);
    },

    // saveToCloset: (productId, data = {}) => {
    //     return axiosClient.patch(`/collections/${productId}/status`, {
    //         status: 'active',
    //         ...data
    //     });
    // }
};