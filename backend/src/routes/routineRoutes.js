const express = require('express');
const routineController = require('../controllers/routineController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();
router.get('/guide', (req, res, next) => {
  if (req.get('authorization')) {
    return authenticate(req, res, error => error ? next(error) : routineController.getGuide(req, res, next));
  }
  return routineController.getGuide(req, res, next);
});
router.use(authenticate);
router.post('/suggest', routineController.suggestRoutine);
router.put('/skin-profile', routineController.updateSkinProfile);
router.get('/my-routine', routineController.getMyRoutine);
router.get('/history', routineController.getHistory);
router.get('/:id', routineController.getRoutineDetail);
router.post('/:id/activate', routineController.activateRoutine);
router.post('/:id/dismiss', routineController.dismissRoutine);
router.post('/:id/copy/check', routineController.checkCopyCompatibility);
router.post('/:id/copy', routineController.executeCopy);
router.get('/:id/share-preview', routineController.getSharePreview);

const profileRouter = express.Router();
profileRouter.use(authenticate);
profileRouter.post('/generate-chain', routineController.generateRoutineChain);
profileRouter.put('/plans/:planId/activate', routineController.activatePlan);
profileRouter.put('/plans/:planId/skip', routineController.skipPlan);
profileRouter.get('/history', routineController.getRoutineHistory);
profileRouter.post('/history/:planId/copy', routineController.copyOldRoutine);
profileRouter.post('/plans/:planId/share-payload', routineController.prepareRoutineForShare);

module.exports = router;
module.exports.profileRouter = profileRouter;
