const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All closet routes require authentication

router.get('/', collectionController.getCloset);
router.post('/', collectionController.addProduct);
router.get('/expiring', collectionController.getExpiringProducts);
router.get('/:id', collectionController.getProductDetail);
router.put('/:id', collectionController.updateProduct);
router.get('/:id/check-delete', collectionController.checkDeleteProduct);
router.delete('/:id', collectionController.deleteProduct);
router.put('/:id/empty', collectionController.markAsEmpty);
router.put('/:id/acknowledge-expired', collectionController.acknowledgeExpiredProduct);

module.exports = router;
