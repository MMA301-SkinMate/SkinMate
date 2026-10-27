const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const singleUserMiddleware = require('../middlewares/singleUserMiddleware');

router.use(singleUserMiddleware);

// ID 8, 9: Gợi ý chuỗi routine (chu kỳ 7 ngày)
router.post('/generate-chain', routineController.generateRoutineChain);

// Kích hoạt phác đồ chính thức
router.put('/plans/:planId/activate', routineController.activatePlan);
router.put('/plans/:planId/skip', routineController.skipPlan);

// ID 41, 42: Lịch sử các chuỗi routine
router.get('/history', routineController.getRoutineHistory);

// ID 43: Sao chép chuỗi routine cũ & tự động thế sản phẩm
router.post('/history/:planId/copy', routineController.copyOldRoutine);

// ID 44: Tạo bài chia sẻ routine lên Community
router.post('/plans/:planId/share-payload', routineController.prepareRoutineForShare);

module.exports = router;