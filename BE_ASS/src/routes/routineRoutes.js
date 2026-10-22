const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// ID 8, 9: Gợi ý chuỗi routine (chu kỳ 7 ngày)
router.post('/generate-chain', routineController.generateRoutineChain);

// Kích hoạt phác đồ chính thức
router.put('/plans/:planId/activate', routineController.activatePlan);

// ID 41, 42: Lịch sử các chuỗi routine
router.get('/history', routineController.getRoutineHistory);

// ID 43: Sao chép chuỗi routine cũ & tự động thế sản phẩm
router.post('/history/:planId/copy', routineController.copyOldRoutine);

// ID 44: Chuẩn bị payload chuỗi routine để chia sẻ lên Community
router.get('/plans/:planId/share-payload', routineController.prepareRoutineForShare);

module.exports = router;