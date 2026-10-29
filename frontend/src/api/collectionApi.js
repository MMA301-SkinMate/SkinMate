import axiosClient from './axiosClient';

const localizeCollectionError = error => {
  const message = error.status === 401
    ? 'Your session has expired. Please sign in again.'
    : error.status === 404
      ? 'This product could not be found.'
      : error.status === 429
        ? 'Too many requests. Please wait and try again.'
        : error.status === 400 || error.status === 422
          ? 'Please check the product information and try again.'
          : error.isNetworkError || error.status === 0
            ? 'Unable to connect. Please check your network and try again.'
            : 'Unable to complete the request. Please try again.';
  return Promise.reject({ ...error, message });
};

export const listCollectionProducts = () => axiosClient.get('/collections').catch(localizeCollectionError);
export const createCollectionProduct = payload => axiosClient.post('/collections', payload).catch(localizeCollectionError);
export const updateCollectionProduct = (id, payload) => axiosClient.patch(`/collections/${id}`, payload).catch(localizeCollectionError);
export const deleteCollectionProduct = id => axiosClient.delete(`/collections/${id}`).catch(localizeCollectionError);

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

