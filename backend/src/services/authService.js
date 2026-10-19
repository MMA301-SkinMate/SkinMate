const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Collection = require('../models/Collection');
const TreatmentPlan = require('../models/TreatmentPlan');
const { calculateSuitabilityScore } = require('../utils/scoreCalculator');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skinmate_default_jwt_secret_key_2026',
    { expiresIn: '30d' }
  );
};

const register = async ({ name, email, password, skinType, allergies }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email này đã được đăng ký tài khoản');
  }

  const user = await User.create({
    name,
    email,
    password,
    skinType: skinType || 'Da_Hon_Hop',
    allergies: allergies || [],
  });

  const token = generateToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const token = generateToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('activeTreatmentPlan');
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }
  return user;
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  // Check if skinType changed (Mục 40: Thiết lập lại hồ sơ da)
  const isSkinTypeChanged =
    updateData.skinType && updateData.skinType !== user.skinType;

  Object.assign(user, updateData);
  await user.save();

  let closetReevaluated = false;
  let activePlanNotice = null;

  if (isSkinTypeChanged) {
    // 1. Re-evaluate closet products score
    const products = await Collection.find({ user: userId, status: 'active' });
    for (const prod of products) {
      const { finalScore } = calculateSuitabilityScore({
        ingredients: prod.ingredients,
        skinType: user.skinType,
        currentConditions: user.currentConditions || ['Bình thường'],
      });
      prod.suitabilityScore = finalScore;
      await prod.save();
    }
    closetReevaluated = true;

    // 2. Check active treatment plan
    const activePlan = await TreatmentPlan.findOne({
      user: userId,
      status: 'active',
    });
    if (activePlan) {
      activePlanNotice =
        'Hồ sơ da đã thay đổi. Phác đồ điều trị đang kích hoạt có thể cần điều chỉnh lại để phù hợp với nền da mới.';
    }
  }

  return {
    user,
    closetReevaluated,
    activePlanNotice,
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new Error('Mật khẩu hiện tại không đúng');
  }

  user.password = newPassword;
  await user.save();

  return { success: true, message: 'Đổi mật khẩu thành công' };
};

module.exports = {
  generateToken,
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
};
