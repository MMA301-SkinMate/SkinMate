const routineService = require('../services/routineService');
const User = require('../models/User');

const getHomeData = async (req, res, next) => {
  try {
    const data = await routineService.getHomeData(req.user._id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const submitCheckin = async (req, res, next) => {
  try {
    const { conditions } = req.body;
    if (!conditions || (Array.isArray(conditions) && conditions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một tình trạng da hôm nay',
      });
    }

    const result = await routineService.submitCheckin(req.user._id, conditions);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const undoCheckin = async (req, res, next) => {
  try {
    const result = await routineService.undoCheckin(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Đã hoàn tác check-in thành công. Routine được khôi phục về trạng thái ban đầu.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTodayDailyRoutine = async (req, res, next) => {
  try {
    const dateStr = req.query.date || routineService.getTodayDateStr();
    const result = await routineService.analyzeAndGenerateDailyRoutine(
      req.user._id,
      req.user.currentConditions || ['Bình thường'],
      dateStr
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const toggleStepCompletion = async (req, res, next) => {
  try {
    const { session, stepNumber } = req.body;
    if (!session || !stepNumber) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp session (morning/evening) và stepNumber',
      });
    }

    const updated = await routineService.toggleStepCompletion(
      req.user._id,
      session,
      stepNumber
    );
    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái hoàn thành bước thành công',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const getTreatmentPlanDetail = async (req, res, next) => {
  try {
    const plan = await routineService.getTreatmentPlanDetail(
      req.user._id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

const suggestRoutinePlan = async (req, res, next) => {
  try {
    const condition = req.query.condition || req.user.currentConditions?.[0] || 'Bình thường';
    const suggestion = await routineService.suggestRoutinePlan(
      req.user._id,
      condition
    );
    return res.status(200).json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
};

const applySuggestedPlan = async (req, res, next) => {
  try {
    const newPlan = await routineService.applySuggestedPlan(
      req.user._id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: 'Đã kích hoạt chuỗi routine thành công!',
      data: newPlan,
    });
  } catch (error) {
    next(error);
  }
};

const addOrEditProductInPlan = async (req, res, next) => {
  try {
    const force = req.query.force === 'true' || req.body.force === true;
    const result = await routineService.addOrEditProductInPlan(
      req.user._id,
      req.params.id,
      req.body,
      force
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const copyRoutineChain = async (req, res, next) => {
  try {
    const result = await routineService.copyRoutineChain(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Sao chép chuỗi routine thành công!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateNotificationSettings = async (req, res, next) => {
  try {
    const { isEnabled, morningTime, eveningTime, notifyExpiringProducts } = req.body;
    const user = await User.findById(req.user._id);

    if (isEnabled !== undefined) user.notificationSettings.isEnabled = isEnabled;
    if (morningTime) user.notificationSettings.morningTime = morningTime;
    if (eveningTime) user.notificationSettings.eveningTime = eveningTime;
    if (notifyExpiringProducts !== undefined)
      user.notificationSettings.notifyExpiringProducts = notifyExpiringProducts;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật cài đặt thông báo check-in',
      data: user.notificationSettings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomeData,
  submitCheckin,
  undoCheckin,
  getTodayDailyRoutine,
  toggleStepCompletion,
  getTreatmentPlanDetail,
  suggestRoutinePlan,
  applySuggestedPlan,
  addOrEditProductInPlan,
  copyRoutineChain,
  updateNotificationSettings,
};
