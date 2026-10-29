import axiosClient from './axiosClient';

export const collectionApi = {
  // Lấy danh sách sản phẩm trong tủ đồ
  getCloset: async (tab = 'active') => {
    return await axiosClient.get('/collection', {
      params: { tab },
    });
  },

  // Chi tiết sản phẩm
  getProductDetail: async (id) => {
    return await axiosClient.get(`/collection/${id}`);
  },

  // Thêm sản phẩm mới vào tủ đồ
  addProduct: async (data) => {
    return await axiosClient.post('/collection', data);
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, data) => {
    return await axiosClient.put(`/collection/${id}`, data);
  },

  // Xóa sản phẩm
  deleteProduct: async (id, force = false) => {
    return await axiosClient.delete(`/collection/${id}`, {
      params: force ? { force: true } : {},
    });
  },
};

export default collectionApi;
