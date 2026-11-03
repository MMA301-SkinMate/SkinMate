const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const controller = require('../controllers/profileController');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.profile);
router.patch('/', controller.updateAccount);
router.post('/change-password', controller.changePassword);
router.post('/skin-profile', controller.resetSkinProfile);

module.exports = router;
