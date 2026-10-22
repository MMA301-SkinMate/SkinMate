const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/guide', optionalProtect, authController.getSkinGuide);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
