const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');

router.post('/analyze', collectionController.analyzeProduct);

module.exports = router;