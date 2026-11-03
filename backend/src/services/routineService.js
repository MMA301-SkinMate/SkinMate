const mongoose = require('mongoose');
const DailyRoutine = require('../models/DailyRoutine');
const Collection = require('../models/Collection');
const AppError = require('../utils/AppError');

const { SKIN_CONDITIONS } = DailyRoutine;
const ACTIVE_STATUSES = ['active', 'expired_warning'];
const DRY_OR_IRRITATED = new Set(['Kho_Rat', 'Kich_Ung']);
const IRRITATING_INGREDIENTS = [
    'bha', 'salicylic acid', 'salicylic', 'aha', 'glycolic', 'lactic acid',
    'retinol', 'retinoid', 'tretinoin', 'benzoyl peroxide',
];
const SOOTHING_INGREDIENTS = [
    'panthenol', 'vitamin b5', 'b5', 'ceramide', 'madecassoside',
    'centella', 'cica', 'allantoin',
];

const dateKey = (value = new Date()) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) throw new AppError('Ngày không hợp lệ.', 400, 'INVALID_DATE');
    return date.toISOString().slice(0, 10);
};

const normalizeConditions = (conditions) => {
    const values = Array.isArray(conditions) ? conditions : [conditions];
    const unique = [...new Set(values)].filter(Boolean);
    const invalid = unique.filter((value) => !SKIN_CONDITIONS.includes(value));
    if (invalid.length) {
        throw new AppError('Tình trạng da không hợp lệ.', 400, 'INVALID_SKIN_CONDITION', invalid);
    }
    if (unique.includes('Binh_Thuong') || unique.length === 0) return ['Binh_Thuong'];
    return unique;
};

const getProducts = async (userId, ids) => {
    const uniqueIds = [...new Set(ids)];
    const validIds = uniqueIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== uniqueIds.length) {
        throw new AppError('Routine chứa sản phẩm không hợp lệ.', 400, 'INVALID_PRODUCT_ID');
    }
    if (!validIds.length) return [];
    const products = await Collection.find({ _id: { $in: validIds }, userId }).lean();
    if (products.length !== validIds.length) {
        throw new AppError('Một hoặc nhiều sản phẩm không thuộc tủ đồ của bạn.', 403, 'PRODUCT_ACCESS_DENIED');
    }
    return products;
};

const hasKeyword = (ingredients = [], keywords) => ingredients.some((ingredient) => {
    const normalized = String(ingredient).toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
});

const serializeRoutine = (routine) => routine ? {
    ...routine,
    skinConditions: routine.skinConditions?.length ? routine.skinConditions : [routine.skinCondition || 'Binh_Thuong'],
} : null;

const findReplacement = async (userId) => {
    const products = await Collection.find({ userId, status: { $in: ACTIVE_STATUSES } })
        .select('productName productType productIcon ingredients status')
        .lean();
    return products.find((product) => hasKeyword(product.ingredients, SOOTHING_INGREDIENTS)) || null;
};

const postponeRoutineChain = async (routine) => {
    // Only shift routines that explicitly belong to a treatment chain. This
    // prevents unrelated legacy daily routines from being moved accidentally.
    if (!routine.routineGroupId) return 0;
    const future = await DailyRoutine.find({
        userId: routine.userId,
        routineGroupId: routine.routineGroupId,
        date: { $gt: routine.date },
    }).sort({ date: -1 });
    if (!future.length) return 0;

    const stamp = Date.now();
    for (const item of future) {
        await DailyRoutine.updateOne(
            { _id: item._id },
            { $set: { date: `__shift__${stamp}_${item._id}` } },
        );
    }
    for (const item of future) {
        const nextDate = new Date(`${item.date}T00:00:00.000Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        await DailyRoutine.updateOne(
            { _id: item._id },
            { $set: { date: dateKey(nextDate), dayNumber: item.dayNumber ? item.dayNumber + 1 : null } },
        );
    }
    return future.length;
};

const applyDrySkinOverride = async (routine, userId) => {
    const conditions = routine.skinConditions?.length ? routine.skinConditions : [routine.skinCondition];
    if (!conditions.some((condition) => DRY_OR_IRRITATED.has(condition))) {
        return { routine, applied: false, postponed: false, missingReplacement: false };
    }

    const productIds = [...new Set([
        ...(routine.morningProducts || []).map(String),
        ...(routine.eveningProducts || []).map(String),
    ])];
    const products = await getProducts(userId, productIds);
    const conflicting = products.filter((product) => hasKeyword(product.ingredients, IRRITATING_INGREDIENTS));
    if (!conflicting.length) return { routine, applied: false, postponed: false, missingReplacement: false };

    const replacement = await findReplacement(userId);
    const missingReplacement = !replacement;
    const replacementId = replacement?._id?.toString();
    const conflictingIds = new Set(conflicting.map((product) => product._id.toString()));
    const replaceIds = (ids) => ids.map((id) => conflictingIds.has(String(id)) && replacementId ? replacement._id : id);

    routine.morningProducts = replaceIds(routine.morningProducts || []);
    routine.eveningProducts = replaceIds(routine.eveningProducts || []);
    routine.isOverridden = true;
    routine.overrideReason = 'Da khô/rát hoặc kích ứng: tạm thay hoạt chất treatment bằng sản phẩm phục hồi.';
    await routine.save();
    const postponedDays = await postponeRoutineChain(routine);

    return {
        routine,
        applied: true,
        postponed: postponedDays > 0,
        postponedDays,
        missingReplacement,
        replacedProductIds: conflicting.map((product) => product._id),
        replacement: replacement || null,
        suggestion: missingReplacement ? 'B5/Panthenol hoặc Ceramide' : null,
    };
};

const getRoutine = async (userId, date) => {
    const routine = await DailyRoutine.findOne({ userId, date: dateKey(date) })
        .populate('morningProducts eveningProducts')
        .lean();
    return serializeRoutine(routine);
};

const upsertRoutine = async (userId, payload) => {
    const date = dateKey(payload.date);
    const morningIds = payload.morningProducts || [];
    const eveningIds = payload.eveningProducts || [];
    await getProducts(userId, [...morningIds, ...eveningIds]);
    const conditions = normalizeConditions(payload.skinConditions || payload.skinCondition);
    const routine = await DailyRoutine.findOneAndUpdate(
        { userId, date },
        {
            $set: {
                skinCondition: conditions[0],
                skinConditions: conditions,
                morningProducts: morningIds,
                eveningProducts: eveningIds,
                ...(payload.routineGroupId !== undefined ? { routineGroupId: payload.routineGroupId } : {}),
                ...(payload.dayNumber !== undefined ? { dayNumber: payload.dayNumber } : {}),
                ...(payload.totalDays !== undefined ? { totalDays: payload.totalDays } : {}),
            },
            $setOnInsert: { userId, date },
        },
        { new: true, upsert: true, runValidators: true },
    );
    return routine;
};

const checkIn = async (userId, payload) => {
    const previous = await DailyRoutine.findOne({ userId, date: dateKey(payload.date) });
    const routine = await upsertRoutine(userId, {
        ...payload,
        // A check-in must not erase the products already scheduled today.
        morningProducts: payload.morningProducts ?? previous?.morningProducts?.map(String) ?? [],
        eveningProducts: payload.eveningProducts ?? previous?.eveningProducts?.map(String) ?? [],
    });
    const result = await applyDrySkinOverride(routine, userId);
    return {
        ...result,
        previousConditions: previous?.skinConditions || (previous?.skinCondition ? [previous.skinCondition] : ['Binh_Thuong']),
        routine: serializeRoutine(result.routine.toObject()),
    };
};

const undoCheckIn = async (userId, payload) => {
    const conditions = normalizeConditions(payload.previousConditions);
    const routine = await DailyRoutine.findOneAndUpdate(
        { userId, date: dateKey(payload.date) },
        { $set: { skinCondition: conditions[0], skinConditions: conditions } },
        { new: true, runValidators: true },
    ).populate('morningProducts eveningProducts');
    if (!routine) throw new AppError('Không tìm thấy routine của ngày này.', 404, 'ROUTINE_NOT_FOUND');
    return serializeRoutine(routine.toObject());
};

module.exports = {
    SKIN_CONDITIONS,
    getRoutine,
    upsertRoutine,
    checkIn,
    undoCheckIn,
    normalizeConditions,
};
