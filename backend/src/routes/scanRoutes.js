const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const scanController = require('../controllers/scanController');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

// OCR Extract from image
router.post('/', upload.single('image'), scanController.scanIngredients);

// 30. Phân tích độ phù hợp da (Score Calculator + Gemini AI Explanation)
router.post('/analyze', optionalProtect, scanController.analyzeSuitability);

// Protected routes (require auth)
router.use(protect);

// 31. Add sản phẩm từ ScanHistory vào tủ đồ
router.post('/history/:id/add-to-collection', scanController.addScannedToCollection);

// 32-34. Scan History management
router.get('/history', scanController.getScanHistory);
router.get('/history/:id', scanController.getScanHistoryDetail);
router.delete('/history/:id', scanController.deleteScanHistory);

module.exports = router;