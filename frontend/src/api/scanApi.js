import axiosClient from './axiosClient';

const scanIngredientImage = (photoUri) => {
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'ingredient_scan.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    formData.append('image', {
        uri: photoUri,
        type,
        name: filename,
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

export default {
    scanIngredientImage,
    getScanHistory,
};
