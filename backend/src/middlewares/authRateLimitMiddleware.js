const { rateLimit } = require('express-rate-limit');
const AppError = require('../utils/AppError');

const createAuthRateLimiter = (limit, message) =>
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler(req, res, next) {
            return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'));
        },
    });

const isProd = process.env.NODE_ENV === 'production';

const createRegisterRateLimiter = () =>
    createAuthRateLimiter(
        isProd ? 5 : 50,
        'Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau.'
    );

const createLoginRateLimiter = () =>
    createAuthRateLimiter(
        isProd ? 10 : 50,
        'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau.'
    );

module.exports = { createRegisterRateLimiter, createLoginRateLimiter };
