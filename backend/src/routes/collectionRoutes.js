const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/collectionController');
const authenticate = require('../middlewares/authMiddleware');
const collectionDto = require('../validations/collectionDto');

// Every collection route requires a valid JWT
router.use(authenticate);

// ── Scan-flow routes (invoked from scan/ProductInfoDetail screens) ──────────
router.post('/analyze', ctrl.analyzeProduct);
router.post('/draft',   collectionDto.create, ctrl.saveDraft);
router.post('/add',     collectionDto.create, ctrl.addProduct);

// ── Expired-alert routes (must come BEFORE /:id to avoid param collision) ──
router.get('/expired-alerts',       ctrl.getExpiredAlerts);
router.post('/:id/resolve-expiry',  ctrl.resolveExpiredAlert);

// ── Collection CRUD ──────────────────────────────────────────────────────────
router.get('/',         ctrl.listProducts);     // ?tab=active|used
router.get('/:id',      ctrl.getProduct);
router.patch('/:id', collectionDto.id, collectionDto.update, ctrl.editProduct);
router.delete('/:id', collectionDto.id, ctrl.removeProduct);
router.post('/:id/finish', collectionDto.id, ctrl.finishProduct);

module.exports = router;
