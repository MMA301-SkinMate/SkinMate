const express = require('express');
const router = express.Router();
const skinProfileController = require('../controllers/skinProfileController');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware giải mã JWT xác thực user

router.use(authMiddleware);

// ID 6, 10: Lấy cẩm nang da Do's & Don'ts cho FAB Guide & Popup
router.get('/guide', skinProfileController.getSkinGuide);

// ID 5, 40: Thiết lập & cập nhật hồ sơ da (kèm re-evaluate tủ đồ)
router.put('/update', skinProfileController.updateSkinProfile);

module.exports = router;