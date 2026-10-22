const authService = require('../services/authService');
const bcrypt = require('bcryptjs');

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email' });

    const result = await authService.forgotPassword(email);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu mã token hoặc mật khẩu mới' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await authService.resetPassword(token, passwordHash);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};