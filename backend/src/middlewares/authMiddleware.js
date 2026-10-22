const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy mã xác thực. Vui lòng đăng nhập.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skinmate_default_jwt_secret_key_2026'
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị xóa.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ.',
      error: error.message,
    });
  }
};

// Optional auth: attaches req.user if token is valid, but doesn't block if missing
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skinmate_default_jwt_secret_key_2026'
    );
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token in optional mode
  }
  next();
};

module.exports = {
  protect,
  optionalProtect,
};
