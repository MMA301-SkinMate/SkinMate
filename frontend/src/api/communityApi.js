import axiosClient from './axiosClient';

export const listCommunityPosts = (params = {}) => axiosClient.get('/community', { params });
export const getCommunityPost = id => axiosClient.get(`/community/${id}`);
export const createCommunityPost = payload => axiosClient.post('/community', payload);
export const deleteCommunityPost = id => axiosClient.delete(`/community/${id}`);
export const toggleCommunityPostLike = id => axiosClient.post(`/community/${id}/like`);
export const copyCommunityRoutine = id => axiosClient.post(`/community/${id}/copy`);

export const updateCommunityPost = (id, payload) => axiosClient.patch(`/community/${id}`, payload);
export const uploadCommunityImages = assets => {
  const formData = new FormData();
  assets.forEach((asset, index) => {
    const uri = typeof asset === 'string' ? asset : asset.uri;
    const type = asset.mimeType || 'image/jpeg';
    const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    formData.append('images', { uri, type, name: `post-${index}.${extension}` });
  });
  return axiosClient.post('/community/image', formData);
};
