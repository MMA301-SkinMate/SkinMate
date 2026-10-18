import axiosClient from './axiosClient';

const scanIngredientImage = (photoUri) => {
    const formData = new FormData();
    formData.append('image', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'ingredient_scan.jpg',
    });

    return axiosClient.post('/scan', formData, {
        timeout: 60000,
    });
};

const getScanHistory = () => {
    return axiosClient.get('/scan/history');
};

export default {
    scanIngredientImage,
    getScanHistory,
};