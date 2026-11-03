import axiosClient from './axiosClient';

const unwrap = (body) => {
  if (body?.data !== undefined) return body.data;
  return body;
};

export const collectionApi = {
  analyzeProduct: (data) => axiosClient.post('/collections/analyze', data).then(unwrap),
  saveDraft: (data) => axiosClient.post('/collections/draft', data).then(unwrap),
  addProduct: (data) => axiosClient.post('/collections/add', data).then(unwrap),
  getAllProduct: (params) => axiosClient.get('/collections', { params }).then(unwrap),
  getProductById: (id) => axiosClient.get(`/collections/${id}`).then(unwrap),
  editProduct: (id, data) => axiosClient.patch(`/collections/${id}`, data).then(unwrap),
  deleteProduct: (id) => axiosClient.delete(`/collections/${id}`).then(unwrap),
  markProductOutOfStock: (id) => axiosClient.patch(`/collections/${id}/finish`).then(unwrap),
  // getDrafts: () => axiosClient.get('/collections', { params: { status: 'draft' } }).then(unwrap),
};


export default collectionApi;
