const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticate = require('../middlewares/authMiddleware');
const uploadProductImage = require('../middlewares/productImageUploadMiddleware');

// Middleware hỗ trợ auth mềm (nếu có token thì gán req.user, nếu không thì cho qua để lấy userId từ body/query)
const optionalAuth = (req, res, next) => {
    if (req.get('authorization')) {
        return authenticate(req, res, next);
    }
    return next();
};

// 1. Nhóm API Phân tích AI & Lưu nháp Scan (UC 26 - 30)
router.post('/analyze', optionalAuth, collectionController.analyzeProduct);
router.post('/draft', optionalAuth, collectionController.saveDraft);
router.post('/add', optionalAuth, collectionController.addProduct);

// 2. Upload ảnh sản phẩm lên Cloudinary
router.post('/image', optionalAuth, (req, res, next) => {
    uploadProductImage.single('image')(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'File ảnh không hợp lệ',
                code: error.code || 'INVALID_IMAGE',
            });
        }
        return next();
    });
}, collectionController.uploadImage);

// 3. Nhóm API Quản lý Tủ đồ (UC 19 - 25)
router.get('/', optionalAuth, collectionController.getAllProduct);
router.get('/all', optionalAuth, collectionController.getAllProduct);
router.post('/', optionalAuth, collectionController.addProduct);

// Đánh dấu sản phẩm dùng hết (UC 23)
router.patch('/:id/finish', optionalAuth, collectionController.markProductOutOfStock);
router.post('/:id/finish', optionalAuth, collectionController.markProductOutOfStock);

// Chi tiết, chỉnh sửa, xóa sản phẩm theo ID (UC 20, 21, 22)
router.get('/:id', optionalAuth, collectionController.getProductById);
router.patch('/:id', optionalAuth, collectionController.editProduct);
router.put('/:id', optionalAuth, collectionController.editProduct);
router.delete('/:id', optionalAuth, collectionController.deleteProduct);

module.exports = router;
