const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All routine endpoints require authentication

// 11. Home screen data
router.get('/home', routineController.getHomeData);

// 12. Notification settings
router.put('/notification-settings', routineController.updateNotificationSettings);

// 13. Daily check-in & 10s undo
router.post('/checkin', routineController.submitCheckin);
router.post('/checkin/undo', routineController.undoCheckin);

// 15 & 16. Today's daily routine & toggle step
router.get('/daily', routineController.getTodayDailyRoutine);
router.put('/step/toggle', routineController.toggleStepCompletion);

// 8 & 9. Suggest routine chain
router.get('/suggest', routineController.suggestRoutinePlan);
router.post('/suggest/apply', routineController.applySuggestedPlan);

// 17 & 18. Treatment Plan detail & Add/Edit with conflict check
router.get('/plan', routineController.getTreatmentPlanDetail);
router.get('/plan/:id', routineController.getTreatmentPlanDetail);
router.post('/plan/:id/product', routineController.addOrEditProductInPlan);

// 41-43. Copy routine chain
router.post('/copy', routineController.copyRoutineChain);

module.exports = router;
