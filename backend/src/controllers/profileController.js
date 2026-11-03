const profileService = require('../services/profileService');
const { sendSuccess } = require('../utils/response');

const profile = async (req, res, next) => {
    try { return sendSuccess(res, { data: await profileService.getProfile(req.user.id) }); } catch (error) { return next(error); }
};

const updateAccount = async (req, res, next) => {
    try { return sendSuccess(res, { message: 'Cập nhật thông tin thành công.', data: await profileService.updateAccount(req.user.id, req.body) }); } catch (error) { return next(error); }
};

const changePassword = async (req, res, next) => {
    try { await profileService.changePassword(req.user.id, req.body); return sendSuccess(res, { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.', data: {} }); } catch (error) { return next(error); }
};

const resetSkinProfile = async (req, res, next) => {
    try { return sendSuccess(res, { message: 'Đã cập nhật hồ sơ da và đánh giá lại tủ đồ.', data: await profileService.resetSkinProfile(req.user.id, req.body) }); } catch (error) { return next(error); }
};

module.exports = { profile, updateAccount, changePassword, resetSkinProfile };
