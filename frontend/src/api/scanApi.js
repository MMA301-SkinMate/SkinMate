import axiosClient from './axiosClient';

const scanIngredientImage = (photoUri) => {
    const formData = new FormData();
    formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'ingredient_scan.jpg',
    });

    return axiosClient.post('/scan', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
    });
};

const getScanHistory = () => {
    return axiosClient.get('/scan/history');
};

const analyzeSuitability = (payload) => {
    return axiosClient.post('/scan/analyze', payload);
};

const addToCollectionFromScan = (historyId, productData) => {
    return axiosClient.post(`/scan/history/${historyId}/add-to-collection`, productData);
};

export default {
    scanIngredientImage,
    getScanHistory,
    analyzeSuitability,
    addToCollectionFromScan,
};
