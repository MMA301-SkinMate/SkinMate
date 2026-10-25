const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister } = require('../validations/authDto');
const createRegisterRateLimiter = require('../middlewares/authRateLimitMiddleware');

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

    return router;
};

module.exports = createAuthRoutes;
