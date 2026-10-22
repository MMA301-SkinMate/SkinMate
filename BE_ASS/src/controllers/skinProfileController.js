const skinProfileService = require('../services/skinProfileService');

exports.getSkinGuide = async (req, res, next) => {
  try {
    const data = await skinProfileService.getSkinGuide(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.updateSkinProfile = async (req, res, next) => {
  try {
    const { skinType, allergies, currentConcerns, cancelActivePlan } = req.body;
    const result = await skinProfileService.updateSkinProfile(req.user.id, {
      skinType,
      allergies,
      currentConcerns,
      cancelActivePlan,
    });
    return res.status(200).json({ success: true, message: 'Cập nhật hồ sơ da thành công', data: result });
  } catch (error) {
    next(error);
  }
};