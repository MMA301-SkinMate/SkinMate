const express = require('express');
const authController = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout,
  validateForgotPassword,
  validateResetPassword,
  validateGoogleExchange,
} = require('../validations/authDto');

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefresh, authController.refresh);
router.post('/logout', validateLogout, authController.logout);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/google', authController.googleStart);
router.get('/google/callback', authController.googleCallback);
router.post('/google/exchange', validateGoogleExchange, authController.exchangeGoogleCode);

module.exports = router;
