const express = require('express');
const collectionController = require('../controllers/collectionController');
const singleUserMiddleware = require('../middlewares/singleUserMiddleware');

const router = express.Router();

router.use(singleUserMiddleware);
router.get('/', collectionController.listProducts);
router.post('/', collectionController.addProduct);
router.put('/:productId', collectionController.updateProduct);
router.delete('/:productId', collectionController.deleteProduct);

module.exports = router;
