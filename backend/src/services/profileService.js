const argon2 = require('argon2');
const User = require('../models/User');
const Collection = require('../models/Collection');
const DailyRoutine = require('../models/DailyRoutine');
const RoutinePlan = require('../models/RoutinePlan');
const { SKIN_DICTIONARY } = require('../models/SkinDictionary');
const { calculateProductScores } = require('./analysisService');
const AppError = require('../utils/AppError');

const PUBLIC_FIELDS = 'fullName email avatarUrl skinProfile';

const getProfile = async (userId) => {
    const user = await User.findById(userId).select(PUBLIC_FIELDS).lean();
    if (!user) throw new AppError('Không tìm thấy tài khoản.', 404, 'USER_NOT_FOUND');
    return user;
};

const updateAccount = async (userId, input = {}) => {
    const updates = {};
    if (typeof input.fullName === 'string') {
        const fullName = input.fullName.trim();
        if (fullName.length < 2 || fullName.length > 100) {
            throw new AppError('Tên phải có từ 2 đến 100 ký tự.', 400, 'INVALID_FULL_NAME');
        }
        updates.fullName = fullName;
    }
    if (input.avatarUrl === null || typeof input.avatarUrl === 'string') {
        if (typeof input.avatarUrl === 'string' && input.avatarUrl.length > 500) {
            throw new AppError('Avatar URL không hợp lệ.', 400, 'INVALID_AVATAR_URL');
        }
        updates.avatarUrl = input.avatarUrl || null;
    }
    if (!Object.keys(updates).length) {
        throw new AppError('Không có thông tin hợp lệ để cập nhật.', 400, 'EMPTY_PROFILE_UPDATE');
    }
    const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
        .select(PUBLIC_FIELDS)
        .lean();
    if (!user) throw new AppError('Không tìm thấy tài khoản.', 404, 'USER_NOT_FOUND');
    return user;
};

const changePassword = async (userId, { currentPassword, newPassword } = {}) => {
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        throw new AppError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.', 400, 'INVALID_PASSWORD_PAYLOAD');
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
        throw new AppError('Mật khẩu mới phải có từ 8 đến 128 ký tự.', 400, 'INVALID_PASSWORD');
    }
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError('Không tìm thấy tài khoản.', 404, 'USER_NOT_FOUND');
    if (!await argon2.verify(user.passwordHash, currentPassword)) {
        throw new AppError('Mật khẩu hiện tại không đúng.', 401, 'INVALID_CURRENT_PASSWORD');
    }
    const passwordHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1,
    });
    await User.updateOne({ _id: userId }, { $set: { passwordHash, passwordChangedAt: new Date() } });
};

const todayString = () => new Date().toISOString().split('T')[0];

const getTodayCondition = async (userId) => {
    const routine = await DailyRoutine.findOne({ userId, date: todayString() }).select('skinConditions skinCondition').lean();
    return routine?.skinConditions?.[0] || routine?.skinCondition || 'Binh_Thuong';
};

const reevaluateCollection = async (userId, skinType) => {
    const todayCondition = await getTodayCondition(userId);
    const routine = await DailyRoutine.findOne({ userId, date: todayString() })
        .populate('morningProducts eveningProducts', 'ingredients')
        .lean();
    const routineIngredients = [
        ...(routine?.morningProducts || []).flatMap((product) => product.ingredients || []),
        ...(routine?.eveningProducts || []).flatMap((product) => product.ingredients || []),
    ];
    const products = await Collection.find({ userId, status: { $in: ['active', 'expired_warning'] } });
    for (const product of products) {
        const scores = calculateProductScores({
            ingredients: product.ingredients,
            skinType,
            todayCondition,
            routineIngredients,
        });
        product.analysisResult = {
            ...(product.analysisResult?.toObject?.() || product.analysisResult || {}),
            baseScore: scores.baseScore,
            contextualScore: scores.contextualScore,
            verdict: {
                text: `Sản phẩm có độ phù hợp ${scores.contextualScore}% với hồ sơ da hiện tại.`,
                badgeLevel: scores.contextualScore >= 80 ? 'success' : scores.contextualScore >= 50 ? 'warning' : 'danger',
            },
        };
        await product.save();
    }
    return products.length;
};

const resetSkinProfile = async (userId, input = {}) => {
    const skinType = input.skinType;
    if (!Object.prototype.hasOwnProperty.call(SKIN_DICTIONARY, skinType)) {
        throw new AppError('Loại da không hợp lệ.', 400, 'INVALID_SKIN_TYPE');
    }
    const user = await User.findById(userId).select('skinProfile').lean();
    if (!user) throw new AppError('Không tìm thấy tài khoản.', 404, 'USER_NOT_FOUND');
    const previousSkinType = user.skinProfile?.skinType || 'Da_Thuong';
    const activePlan = await RoutinePlan.findOne({ userId, status: 'active' }).select('_id title currentDay totalDays').lean();
    if (activePlan && previousSkinType !== skinType && input.confirmCancelActivePlan !== true) {
        throw new AppError('Đổi hồ sơ da sẽ hủy phác đồ đang chạy.', 409, 'ACTIVE_PLAN_REQUIRES_CONFIRM', [activePlan]);
    }

    const dictionary = SKIN_DICTIONARY[skinType];
    await User.updateOne({ _id: userId }, {
        $set: {
            'skinProfile.skinType': skinType,
            'skinProfile.customDos': dictionary.dos,
            'skinProfile.customDonts': dictionary.donts,
        },
    });

    if (activePlan && previousSkinType !== skinType) {
        await RoutinePlan.updateOne({ _id: activePlan._id }, { $set: { status: 'cancelled' } });
        await DailyRoutine.deleteMany({ userId, routinePlanId: activePlan._id });
    }
    const reevaluatedCount = previousSkinType === skinType ? 0 : await reevaluateCollection(userId, skinType);
    return {
        profile: await getProfile(userId),
        previousSkinType,
        reevaluatedCount,
        cancelledPlan: Boolean(activePlan && previousSkinType !== skinType),
        guide: { dos: dictionary.dos, donts: dictionary.donts, description: dictionary.description },
    };
};

module.exports = { getProfile, updateAccount, changePassword, resetSkinProfile };
