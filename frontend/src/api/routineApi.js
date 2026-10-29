import axiosClient from './axiosClient';

export const routineApi = {
  // 11. Lấy dữ liệu tổng hợp cho trang Home (Profile, Widget Check-in, Routine hôm nay, Community Posts)
  getHomeData: async () => {
    return await axiosClient.get('/routine/home');
  },

  // 13. Check-in tình trạng da hàng ngày
  submitCheckin: async (conditions) => {
    return await axiosClient.post('/routine/checkin', { conditions });
  },

  // 13. Hoàn tác check-in trong 10 giây
  undoCheckin: async () => {
    return await axiosClient.post('/routine/checkin/undo');
  },

  // 15 & 16. Lấy chi tiết chu trình 5 bước hôm nay
  getTodayDailyRoutine: async (date) => {
    return await axiosClient.get('/routine/daily', {
      params: date ? { date } : {},
    });
  },

  // Đánh dấu hoàn thành bước skincare
  toggleStepCompletion: async (session, stepNumber) => {
    return await axiosClient.put('/routine/step/toggle', { session, stepNumber });
  },

  // 17. Xem chi tiết Chuỗi Routine (Treatment Plan)
  getTreatmentPlanDetail: async (planId) => {
    const url = planId ? `/routine/plan/${planId}` : '/routine/plan';
    return await axiosClient.get(url);
  },

  // 15. Gợi ý chuỗi routine (khi chưa có chu trình)
  suggestRoutinePlan: async (condition) => {
    return await axiosClient.get('/routine/suggest', {
      params: condition ? { condition } : {},
    });
  },

  // Kích hoạt chuỗi routine gợi ý
  applySuggestedPlan: async (planData) => {
    return await axiosClient.post('/routine/suggest/apply', planData);
  },

  // 18. Thêm/Sửa sản phẩm vào chuỗi routine + Check xung đột y khoa
  addOrEditProductInPlan: async (planId, payload, force = false) => {
    return await axiosClient.post(`/routine/plan/${planId}/product`, payload, {
      params: force ? { force: true } : {},
    });
  },

  // 12. Cập nhật cài đặt giờ thông báo check-in
  updateNotificationSettings: async (settings) => {
    return await axiosClient.put('/routine/notification-settings', settings);
  },
};

export default routineApi;
