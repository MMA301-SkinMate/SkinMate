const authService = require('../services/authService');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validations/authDto');
const { SKIN_DICTIONARY, CONDITION_DICTIONARY } = require('../utils/scoreCalculator');

const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await authService.register(value);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await authService.login(value);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await authService.updateProfile(req.user._id, value);
    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await authService.changePassword(
      req.user._id,
      value.currentPassword,
      value.newPassword
    );
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mục 6 & 10: Popup Cẩm nang da & FAB Guide Do's & Don'ts
 */
const getSkinGuide = async (req, res, next) => {
  try {
    const userSkinType = req.user?.skinType || 'Da_Hon_Hop';
    const guide = SKIN_DICTIONARY[userSkinType] || SKIN_DICTIONARY['Da_Hon_Hop'];

    return res.status(200).json({
      success: true,
      data: {
        skinType: userSkinType,
        skinTypeName: guide.name,
        dos: guide.dos,
        donts: guide.donts,
        conditionDictionary: CONDITION_DICTIONARY,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getSkinGuide,
};
