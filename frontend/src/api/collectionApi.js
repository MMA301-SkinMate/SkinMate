import axiosClient from './axiosClient';

export const listCollectionProducts = () => axiosClient.get('/collections');
export const createCollectionProduct = payload => axiosClient.post('/collections', payload);
export const updateCollectionProduct = (id, payload) => axiosClient.patch(`/collections/${id}`, payload);
export const deleteCollectionProduct = id => axiosClient.delete(`/collections/${id}`);

export const uploadCollectionProductImage = imageUri => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || `product-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpg';
  const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('image', {
    uri: imageUri,
    type,
    name: filename,
  });
  return axiosClient.post('/collections/image', formData);
};

