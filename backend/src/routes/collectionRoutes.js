const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.post('/analyze', collectionController.analyzeProduct);
router.post('/draft', collectionController.saveDraft);
router.post('/add', collectionController.addProduct);

module.exports = router;