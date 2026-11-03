import axiosClient from './axiosClient';

const unwrap = (body) => {
  if (body?.data !== undefined) return body.data;
  return body;
};

// 1. Đối tượng collectionApi phục vụ luồng Scan & Analyze (ProductInfoDetailScreen, AddProductScreen)
export const collectionApi = {
  analyzeProduct: (data) => axiosClient.post('/collections/analyze', data).then(unwrap),
  saveDraft: (data) => axiosClient.post('/collections/draft', data).then(unwrap),
  addProduct: (data) => axiosClient.post('/collections/add', data).then(unwrap),
  getAllProduct: (params) => axiosClient.get('/collections', { params }).then(unwrap),
  getProductById: (id) => axiosClient.get(`/collections/${id}`).then(unwrap),
  editProduct: (id, data) => axiosClient.patch(`/collections/${id}`, data).then(unwrap),
  deleteProduct: (id) => axiosClient.delete(`/collections/${id}`).then(unwrap),
  markProductOutOfStock: (id) => axiosClient.patch(`/collections/${id}/finish`).then(unwrap),
  getDrafts: () => axiosClient.get('/collections', { params: { status: 'draft' } }).then(unwrap),
};

// 2. Named exports phục vụ CollectionContext và MyCollectionScreen
export const listCollectionProducts = (params = {}) => {
  return axiosClient.get('/collections', { params }).then(res => {
    const products = Array.isArray(res?.data) ? res.data : (res?.products || res || []);
    return { products, total: products.length };
  });
};

export const createCollectionProduct = (payload) => {
  return axiosClient.post('/collections/add', payload).then(res => {
    const product = res?.data || res?.product || res;
    return { product };
  });
};

export const updateCollectionProduct = (id, payload) => {
  return axiosClient.patch(`/collections/${id}`, payload).then(res => {
    const product = res?.data || res?.product || res;
    return { product };
  });
};

export const deleteCollectionProduct = (id) => {
  return axiosClient.delete(`/collections/${id}`).then(res => res?.data || res);
};

export default collectionApi;
