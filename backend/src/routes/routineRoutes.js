const express = require('express');
const routineController = require('../controllers/routineController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

// UC 6 & UC 10: Cẩm nang Do's & Don'ts (cho phép cả khi chưa đăng nhập nếu truyền query, hoặc đã đăng nhập)
router.get('/guide', (req, res, next) => {
    const authHeader = req.get('authorization');
    if (authHeader) {
        return authenticate(req, res, () => routineController.getGuide(req, res, next));
    }
    return routineController.getGuide(req, res, next);
});

// Các routes yêu cầu đăng nhập:
router.use(authenticate);

// UC 8: Gợi ý chuỗi routine 7 ngày
router.post('/suggest', routineController.suggestRoutine);

// UC 40: Thiết lập lại hồ sơ da
router.put('/skin-profile', routineController.updateSkinProfile);

// UC 41: Lịch sử các chuỗi routine
router.get('/history', routineController.getHistory);

// UC 9 & UC 42: Chi tiết chuỗi routine
router.get('/:id', routineController.getRoutineDetail);

// UC 9: Kích hoạt chuỗi routine
router.post('/:id/activate', routineController.activateRoutine);

// UC 9: Bỏ qua chuỗi routine (Lưu nháp)
router.post('/:id/dismiss', routineController.dismissRoutine);

// UC 43: Kiểm tra đối chiếu trước khi copy
router.post('/:id/copy/check', routineController.checkCopyCompatibility);

// UC 43: Thực hiện copy chuỗi routine
router.post('/:id/copy', routineController.executeCopy);

// UC 44: Lấy dữ liệu routine để chia sẻ
router.get('/:id/share-preview', routineController.getSharePreview);

module.exports = router;
