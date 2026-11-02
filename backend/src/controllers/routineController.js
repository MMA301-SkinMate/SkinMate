const routineService = require('../services/routineService');

exports.getTodayDailyRoutine = async (req, res, next) => {
  try {
    const routine = await routineService.getTodayDailyRoutine(req.user.id);
    res.status(200).json({ routine });
  } catch (error) {
    next(error);
  }
};

exports.checkInSkin = async (req, res, next) => {
  try {
    const { conditions } = req.body;
    const routine = await routineService.checkInSkin(req.user.id, { conditions });
    res.status(200).json({ routine, message: 'Check-in thành công' });
  } catch (error) {
    next(error);
  }
};

exports.undoCheckIn = async (req, res, next) => {
  try {
    const routine = await routineService.undoCheckIn(req.user.id);
    res.status(200).json({ routine, message: 'Đã hoàn tác check-in' });
  } catch (error) {
    next(error);
  }
};

exports.getActivePlan = async (req, res, next) => {
  try {
    const plan = await routineService.getActiveTreatmentPlan(req.user.id);
    res.status(200).json({ plan });
  } catch (error) {
    next(error);
  }
};

exports.getSuggestedPlans = async (req, res, next) => {
  try {
    const plans = await routineService.getSuggestedTreatmentPlans(req.user.id);
    res.status(200).json({ plans });
  } catch (error) {
    next(error);
  }
};

exports.getPlanDetail = async (req, res, next) => {
  try {
    const TreatmentPlan = require('../models/TreatmentPlan');
    const plan = await TreatmentPlan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ error: { message: 'Không tìm thấy chuỗi routine' } });
    }
    res.status(200).json({ plan });
  } catch (error) {
    next(error);
  }
};

exports.activatePlan = async (req, res, next) => {
  try {
    const plan = await routineService.activateTreatmentPlan(req.user.id, req.params.planId);
    res.status(200).json({ plan, message: 'Đã kích hoạt chuỗi routine thành công' });
  } catch (error) {
    next(error);
  }
};

exports.updatePlanProduct = async (req, res, next) => {
  try {
    const { dayNumber, stepNumber, productId, customProduct } = req.body;
    const plan = await routineService.updateTreatmentPlanProduct(req.user.id, req.params.planId, {
      dayNumber,
      stepNumber,
      productId,
      customProduct,
    });
    res.status(200).json({ plan, message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    next(error);
  }
};

exports.addPlanDay = async (req, res, next) => {
  try {
    const plan = await routineService.addDayToTreatmentPlan(req.user.id, req.params.planId, req.body);
    res.status(201).json({ plan, message: 'Thêm ngày mới vào chuỗi routine thành công' });
  } catch (error) {
    next(error);
  }
};

exports.checkConflict = async (req, res, next) => {
  try {
    const { dayNumber, newProduct, existingProductIds, planId } = req.body;
    const result = await routineService.checkConflict({
      dayNumber,
      newProduct,
      existingProductIds,
      planId,
      userId: req.user.id,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getExternalRecommendations = async (req, res, next) => {
  try {
    const recommendations = routineService.EXTERNAL_RECOMMENDATIONS;
    res.status(200).json({ recommendations });
  } catch (error) {
    next(error);
  }
};

