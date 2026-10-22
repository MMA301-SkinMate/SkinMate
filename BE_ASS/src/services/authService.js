const crypto = require('crypto');
const User = require('../models/User');

/**
 * Gửi token đặt lại mật khẩu (UC 10.0 - Quên mật khẩu)
 */
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Để bảo mật, không báo lộ email có tồn tại hay không
    return { success: true, message: 'Nếu email tồn tại trên hệ thống, mã đặt lại mật khẩu đã được gửi.' };
  }

  // Tạo reset token ngẫu nhiên
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút
  await user.save();

  // Tại đây bạn tích hợp gửi mail (Nodemailer/SendGrid)
  // console.log(`[RESET PASSWORD TOKEN]: ${resetToken}`);

  return {
    success: true,
    message: 'Mã xác nhận đặt lại mật khẩu đã được tạo thành công.',
    resetToken, // Trả về token phục vụ test postman hoặc gửi mail
  };
};

/**
 * Đặt lại mật khẩu mới bằng token
 */
exports.resetPassword = async (token, newPasswordHash) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw new Error('Mã xác nhận không hợp lệ hoặc đã hết hạn.');
  }

  user.passwordHash = newPasswordHash;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.passwordChangedAt = new Date();
  await user.save();

  return { success: true, message: 'Đặt lại mật khẩu thành công.' };
};