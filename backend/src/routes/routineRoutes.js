const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authMiddleware');
const routineController = require('../controllers/routineController');

router.use(authenticate);

// Daily Routine endpoints
router.get('/daily', routineController.getTodayDailyRoutine);
router.post('/daily/checkin', routineController.checkInSkin);
router.post('/daily/undo', routineController.undoCheckIn);

// Treatment Plan endpoints
router.get('/plan/active', routineController.getActivePlan);
router.get('/plan/suggested', routineController.getSuggestedPlans);
router.get('/plan/:planId', routineController.getPlanDetail);
router.post('/plan/:planId/activate', routineController.activatePlan);
router.post('/plan/:planId/product', routineController.updatePlanProduct);
router.post('/plan/:planId/day', routineController.addPlanDay);

// Conflict analysis and suggestions
router.post('/check-conflict', routineController.checkConflict);
router.get('/external-recommendations', routineController.getExternalRecommendations);

module.exports = router;

