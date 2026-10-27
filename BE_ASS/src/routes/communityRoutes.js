const express = require('express');
const communityController = require('../controllers/communityController');
const singleUserMiddleware = require('../middlewares/singleUserMiddleware');

const router = express.Router();

router.use(singleUserMiddleware);
router.get('/posts', communityController.listPosts);

module.exports = router;
