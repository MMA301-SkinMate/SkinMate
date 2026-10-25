const { rateLimit } = require('express-rate-limit');
const AppError = require('../utils/AppError');

const createRegisterRateLimiter = () =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 5,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler(req, res, next) {
            return next(
                new AppError(
                    'Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau.',
                    429,
                    'RATE_LIMIT_EXCEEDED'
                )
            );
        },
    });

module.exports = createRegisterRateLimiter;
