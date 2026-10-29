const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validations/authDto');
const {
    createRegisterRateLimiter,
    createLoginRateLimiter,
} = require('../middlewares/authRateLimitMiddleware');

const createAuthRoutes = () => {
    const router = express.Router();

    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        return next();
    });
    router.post(
        '/register',
        createRegisterRateLimiter(),
        validateRegister,
        authController.register
    );
    router.post(
        '/login',
        createLoginRateLimiter(),
        validateLogin,
        authController.login
    );

    return router;
};

module.exports = createAuthRoutes;
