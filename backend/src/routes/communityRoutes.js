const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// Feed & detail can be viewed without login, but protected features need auth
router.get('/', optionalProtect, communityController.getPosts);
router.get('/:id', optionalProtect, communityController.getPostDetail);

// Protected routes
router.post('/', protect, communityController.createPost);
router.post('/:id/like', protect, communityController.toggleLikePost);
router.post('/:id/copy', protect, communityController.copyPostRoutine);
router.post('/:id/report', protect, communityController.reportPost);

module.exports = router;
