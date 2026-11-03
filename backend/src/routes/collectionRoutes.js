const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/analyze', collectionController.analyzeProduct);
router.post('/draft', collectionController.saveDraft);
router.post('/add', collectionController.addProduct);

router.get('/', collectionController.getAllProduct);
router.post('/:id/finish', collectionController.markProductOutOfStock);
router.get('/:id', collectionController.getProductById);
router.patch('/:id', collectionController.editProduct);
router.delete('/:id', collectionController.deleteProduct);

module.exports = router;
