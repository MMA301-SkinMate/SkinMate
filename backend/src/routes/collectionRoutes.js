const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticate = require('../middlewares/authMiddleware');

// Tất cả các thao tác với Collection đều yêu cầu đăng nhập
router.use(authenticate);

// 1. Phân tích sản phẩm & lưu nháp (UC 26 - 30)
router.post('/analyze', collectionController.analyzeProduct);
router.post('/draft', collectionController.saveDraft);
router.post('/add', collectionController.addProduct);

// 2. Quản lý Tủ đồ (UC 19 - 25)
router.get('/', collectionController.getAllProduct);
router.get('/all', collectionController.getAllProduct);
router.post('/', collectionController.addProduct);

// Đánh dấu sản phẩm dùng hết (UC 23)
router.patch('/:id/finish', collectionController.markProductOutOfStock);
router.post('/:id/finish', collectionController.markProductOutOfStock);

// Chi tiết, chỉnh sửa, xóa sản phẩm (UC 20, 21, 22)
router.get('/:id', collectionController.getProductById);
router.patch('/:id', collectionController.editProduct);
router.put('/:id', collectionController.editProduct);
router.delete('/:id', collectionController.deleteProduct);

module.exports = router;
