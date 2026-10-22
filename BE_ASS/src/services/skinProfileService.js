const User = require('../models/User');
const SkinDictionary = require('../models/SkinDictionary');
const MyCollection = require('../models/MyCollection');
const TreatmentPlan = require('../models/TreatmentPlan');

/**
 * 1. Lấy thông tin cẩm nang da (Do's & Don'ts) dựa trên loại da và dị ứng
 */
exports.getSkinGuide = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.skinProfile?.skinType) {
    return { dos: [], donts: user?.skinProfile?.allergies || [] };
  }

  const dictionary = await SkinDictionary.findOne({ skinType: user.skinProfile.skinType });
  const dos = dictionary ? dictionary.dos : [];
  let donts = dictionary ? [...dictionary.donts] : [];

  // Thêm các chất dị ứng của người dùng vào danh mục Don'ts
  if (user.skinProfile.allergies && user.skinProfile.allergies.length > 0) {
    user.skinProfile.allergies.forEach((allergy) => {
      if (!donts.some((d) => d.ingredientName?.toLowerCase() === allergy.toLowerCase())) {
        donts.push({ ingredientName: allergy, reason: 'Dị ứng cá nhân trong hồ sơ' });
      }
    });
  }

  return { skinType: user.skinProfile.skinType, dos, donts };
};

/**
 * 2. Thiết lập hoặc cập nhật lại hồ sơ da
 * Xử lý: Tra cứu cẩm nang mới, tính toán lại độ phù hợp của tủ đồ, cảnh báo/hủy phác đồ cũ nếu được yêu cầu
 */
exports.updateSkinProfile = async (userId, { skinType, allergies, currentConcerns, cancelActivePlan = false }) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Không tìm thấy người dùng');

  const oldSkinType = user.skinProfile?.skinType;
  const isSkinTypeChanged = oldSkinType && oldSkinType !== skinType;

  // Kiểm tra phác đồ đang chạy nếu có thay đổi loại da
  let activePlanWarning = null;
  if (isSkinTypeChanged) {
    const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
    if (activePlan) {
      if (cancelActivePlan) {
        activePlan.status = 'canceled';
        await activePlan.save();
      } else {
        activePlanWarning = {
          hasActivePlan: true,
          planId: activePlan._id,
          message: 'Việc đổi loại da sẽ tác động đến phác đồ điều trị đang chạy. Vui lòng xác nhận hủy phác đồ cũ.',
        };
      }
    }
  }

  // Cập nhật User
  user.skinProfile = {
    skinType,
    allergies: allergies || [],
    currentConcerns: currentConcerns || [],
  };
  await user.save();

  // Đánh giá lại độ phù hợp của các sản phẩm trong tủ đồ
  const closetProducts = await MyCollection.find({ userId, status: { $in: ['active', 'expiring'] } });
  const dictionary = await SkinDictionary.findOne({ skinType });
  const dontList = dictionary ? dictionary.donts.map((d) => d.ingredientName.toLowerCase()) : [];

  const evaluatedCloset = closetProducts.map((p) => {
    let hasConflict = false;
    const conflictingIngredients = [];

    p.ingredientsList.forEach((ing) => {
      const lower = ing.toLowerCase();
      if (dontList.some((dont) => lower.includes(dont)) || (allergies || []).some((a) => lower.includes(a.toLowerCase()))) {
        hasConflict = true;
        conflictingIngredients.push(ing);
      }
    });

    return {
      productId: p._id,
      productName: p.productName,
      suitable: !hasConflict,
      conflictingIngredients,
    };
  });

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      skinProfile: user.skinProfile,
    },
    activePlanWarning,
    evaluatedCloset,
  };
};