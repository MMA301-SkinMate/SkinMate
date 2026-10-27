const routineService = require('../services/routineService');

exports.generateRoutineChain = async (req, res, next) => {
  try {
    const { targetConcern } = req.body || {};
    if (targetConcern !== undefined && (typeof targetConcern !== 'string' || !targetConcern.trim())) {
      return res.status(400).json({ success: false, message: 'Mối quan tâm về da không hợp lệ' });
    }
    const plan = await routineService.generateRoutineChain(req.user.id, targetConcern);
    return res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

exports.activatePlan = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const plan = await routineService.activatePlan(req.user.id, planId);
    return res.status(200).json({ success: true, message: 'Đã kích hoạt chuỗi routine', data: plan });
  } catch (error) {
    next(error);
  }
};

exports.skipPlan = async (req, res, next) => {
  try {
    const plan = await routineService.skipPlan(req.user.id, req.params.planId);
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

exports.getRoutineHistory = async (req, res, next) => {
  try {
    const history = await routineService.getRoutineHistory(req.user.id);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

exports.copyOldRoutine = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const { overrideActive } = req.body || {};
    if (overrideActive !== undefined && typeof overrideActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Giá trị xác nhận thay routine không hợp lệ' });
    }
    const result = await routineService.copyOldRoutine(req.user.id, planId, overrideActive);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.prepareRoutineForShare = async (req, res, next) => {
  try {
    const { planId } = req.params;
    const shareData = await routineService.prepareRoutineForShare(req.user.id, planId, req.body || {});
    return res.status(201).json({ success: true, data: shareData });
  } catch (error) {
    next(error);
  }
};