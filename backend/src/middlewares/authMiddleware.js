const authService = require('../services/authService');
const User = require('../models/User');
const AppError = require('../errors/app-error');

async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const match = header.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
      return next(new AppError('Bearer access token is required', 401, 'UNAUTHORIZED'));
    }

    const payload = authService.verifyAccessToken(match[1]);
    const user = await User.findOne({ _id: payload.sub, isActive: true });
    if (!user) {
      return next(new AppError('User account is inactive or unavailable', 401, 'UNAUTHORIZED'));
    }

    req.user = authService.toSafeUser(user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError' || error.code === 'INVALID_ACCESS_TOKEN') {
      return next(new AppError('Access token is invalid or expired', 401, 'INVALID_ACCESS_TOKEN'));
    }
    next(error);
  }
}

module.exports = { requireAuth };
