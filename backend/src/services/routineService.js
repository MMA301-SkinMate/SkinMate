const mongoose = require('mongoose');
const DailyRoutine = require('../models/DailyRoutine');
const Collection = require('../models/Collection');
const User = require('../models/User');
const RoutinePlan = require('../models/RoutinePlan');
const { CONDITION_DICTIONARY, CONFLICT_MATRIX } = require('../models/SkinDictionary');
const { analyzeRoutineRecommendation } = require('./geminiService');
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
const STEP_TYPES = {
    cleanser: ['cleanser'],
    toner: ['toner', 'essences'],
    treatment: ['treatment', 'serum', 'exfoliant', 'mask'],
    moisturizer: ['moisturizer', 'cream', 'oil'],
    sunscreen: ['sunscreen'],
};
const STEP_ORDER = ['cleanser', 'toner', 'treatment', 'moisturizer', 'sunscreen'];

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

const normalizeProfileTerms = (values = []) => values
    .filter((value) => typeof value === 'string')
    .map((value) => value.toLowerCase().replace(/^#sym:/, '').trim())
    .filter(Boolean);

const productMatchesAny = (product, terms) => {
    const haystack = [product.productName, product.productType, ...(product.ingredients || [])]
        .join(' ').toLowerCase();
    return terms.some((term) => haystack.includes(term));
};

const getProductScore = (product, profile, conditions) => {
    const ingredients = product.ingredients || [];
    const dos = normalizeProfileTerms(profile.customDos);
    const donts = normalizeProfileTerms(profile.customDonts);
    const allergies = normalizeProfileTerms(profile.allergies);
    const conditionValues = conditions || ['Binh_Thuong'];
    let score = 70;
    ingredients.forEach((ingredient) => {
        const value = String(ingredient).toLowerCase();
        if (dos.some((term) => value.includes(term))) score += 10;
        if (donts.some((term) => value.includes(term))) score -= 25;
        if (allergies.some((term) => value.includes(term))) score -= 100;
        if (conditionValues.some((condition) => ['Kho_Rat', 'Kich_Ung'].includes(condition)) && hasKeyword([ingredient], SOOTHING_INGREDIENTS)) score += 20;
        if (conditionValues.some((condition) => ['Kho_Rat', 'Kich_Ung'].includes(condition)) && hasKeyword([ingredient], ['aha', 'bha', 'retinol', 'fragrance', 'alcohol denat'])) score -= 40;
        if (conditionValues.includes('Noi_Mun') && hasKeyword([ingredient], ['salicylic acid', 'azelaic acid', 'niacinamide', 'zinc pca'])) score += 20;
        if (conditionValues.includes('Bong_Dau') && hasKeyword([ingredient], ['niacinamide', 'zinc pca', 'salicylic acid'])) score += 15;
    });
    if (productMatchesAny(product, donts) || productMatchesAny(product, allergies)) score -= 100;
    return Math.max(0, Math.min(100, score));
};

const validateRoutineProducts = async (userId, payload = {}) => {
    const ids = [...new Set([...(payload.morningProducts || []), ...(payload.eveningProducts || [])])];
    const products = await getProducts(userId, ids);
    const user = await User.findById(userId).select('skinProfile').lean();
    const profile = user?.skinProfile || {};
    const conditions = normalizeConditions(payload.conditions || payload.skinConditions || 'Binh_Thuong');
    const allergies = normalizeProfileTerms(profile.allergies);
    const donts = normalizeProfileTerms(profile.customDonts);
    const taboo = conditions.flatMap((condition) => CONDITION_DICTIONARY[condition]?.taboo || []).map((value) => value.toLowerCase());
    const conflicts = [];
    const addConflict = (type, productNames, message) => conflicts.push({ type, productNames, message });

    products.forEach((product) => {
        const ingredients = product.ingredients || [];
        if (ingredients.some((ingredient) => allergies.some((term) => String(ingredient).toLowerCase().includes(term)))) {
            addConflict('allergy', [product.productName], `${product.productName} chứa thành phần nằm trong danh sách dị ứng.`);
        }
        if (ingredients.some((ingredient) => [...donts, ...taboo].some((term) => String(ingredient).toLowerCase().includes(term)))) {
            addConflict('skin_profile', [product.productName], `${product.productName} có thành phần không phù hợp với hồ sơ hoặc tình trạng da hôm nay.`);
        }
    });

    for (let index = 0; index < products.length; index += 1) {
        for (let next = index + 1; next < products.length; next += 1) {
            const first = products[index];
            const second = products[next];
            const firstIngredients = (first.ingredients || []).map((item) => String(item).toLowerCase());
            const secondIngredients = (second.ingredients || []).map((item) => String(item).toLowerCase());
            Object.entries(CONFLICT_MATRIX).forEach(([active, rule]) => {
                const activeInFirst = firstIngredients.some((item) => item.includes(active.toLowerCase()));
                const activeInSecond = secondIngredients.some((item) => item.includes(active.toLowerCase()));
                const firstConflicts = rule.conflictsWith.some((item) => firstIngredients.some((value) => value.includes(item.toLowerCase())));
                const secondConflicts = rule.conflictsWith.some((item) => secondIngredients.some((value) => value.includes(item.toLowerCase())));
                if ((activeInFirst && secondConflicts) || (activeInSecond && firstConflicts)) {
                    addConflict('ingredient_conflict', [first.productName, second.productName], `Không nên dùng ${first.productName} và ${second.productName} cùng routine vì xung đột hoạt chất.`);
                }
            });
        }
    }
    return { valid: conflicts.length === 0, conflicts, checkedProductIds: ids };
};

const recommendRoutine = async (userId, payload = {}) => {
    const user = await User.findById(userId).select('skinProfile').lean();
    if (!user) throw new AppError('Không tìm thấy hồ sơ người dùng.', 404, 'USER_NOT_FOUND');
    const conditions = normalizeConditions(payload.conditions || payload.skinConditions || 'Binh_Thuong');
    const profile = user.skinProfile || {};
    // Only active products are eligible for a new recommendation. Products in
    // expired_warning are intentionally excluded even if the user continued
    // using them, because a routine chain must not schedule expired items.
    const products = await Collection.find({ userId, status: 'active' })
        .select('productName productType productIcon ingredients status note')
        .lean();
    const scored = products.map((product) => ({ ...product, matchScore: getProductScore(product, profile, conditions) }));
    const selected = {};
    const missingProducts = [];
    for (const step of STEP_ORDER) {
        const candidates = scored
            .filter((product) => STEP_TYPES[step].includes(product.productType) && product.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
        selected[step] = candidates[0] || null;
        if (!selected[step]) {
            const requiredIngredients = step === 'treatment' && conditions.some((condition) => ['Kho_Rat', 'Kich_Ung'].includes(condition))
                ? ['Panthenol', 'Ceramide', 'Centella Asiatica']
                : step === 'treatment' ? ['Niacinamide', 'Azelaic Acid'] : [];
            missingProducts.push({ step, requiredIngredients, reason: `Chưa có sản phẩm phù hợp cho bước ${step}.` });
        }
    }
    const morning = STEP_ORDER.filter((step) => selected[step]).map((step) => selected[step]);
    const evening = STEP_ORDER.filter((step) => step !== 'sunscreen' && selected[step]).map((step) => selected[step]);
    const recommendation = {
        source: 'collection',
        conditions,
        profile: { skinType: profile.skinType, customDos: profile.customDos || [], customDonts: profile.customDonts || [] },
        morningProducts: morning,
        eveningProducts: evening,
        missingProducts,
        message: missingProducts.length ? 'Routine đã dùng các sản phẩm phù hợp trong tủ; một số bước cần bổ sung thành phần.' : 'Đã tạo routine từ các sản phẩm phù hợp trong tủ đồ.',
    };
    recommendation.ai = await analyzeRoutineRecommendation(recommendation);
    recommendation.externalSuggestions = recommendation.ai.externalSuggestions;
    recommendation.explanation = recommendation.ai.summary;
    recommendation.stepReasons = recommendation.ai.stepReasons;
    return recommendation;
};

const createRoutinePlan = async (userId, payload) => {
    const recommendation = payload.recommendation || await recommendRoutine(userId, payload);
    const totalDays = Number(payload.totalDays || 14);
    const startDate = dateKey(payload.startDate || new Date());
    const morningIds = (payload.morningProducts || recommendation.morningProducts || []).map((product) => product._id || product);
    const eveningIds = (payload.eveningProducts || recommendation.eveningProducts || []).map((product) => product._id || product);
    const requestedDays = Array.isArray(payload.days) && payload.days.length
        ? payload.days.map((day, index) => ({
            dayNumber: Number(day.dayNumber || index + 1),
            morningProducts: (day.morningProducts || []).map((product) => product._id || product),
            eveningProducts: (day.eveningProducts || []).map((product) => product._id || product),
        }))
        : null;
    const allDayProducts = requestedDays?.flatMap((day) => [...day.morningProducts, ...day.eveningProducts]) || [];
    await getProducts(userId, [...morningIds, ...eveningIds, ...allDayProducts]);
    await RoutinePlan.updateMany({ userId, status: 'active' }, { $set: { status: 'cancelled' } });
    const days = requestedDays || Array.from({ length: totalDays }, (_, index) => ({ dayNumber: index + 1, morningProducts: morningIds, eveningProducts: eveningIds }));
    const plan = await RoutinePlan.create({
        userId,
        title: payload.title,
        startDate,
        totalDays,
        days,
        source: recommendation.source,
        profileSnapshot: recommendation.profile,
        explanation: recommendation.explanation,
        stepReasons: recommendation.stepReasons,
        externalSuggestions: recommendation.externalSuggestions,
    });
    await DailyRoutine.deleteMany({ userId, date: { $gte: startDate }, routinePlanId: { $ne: plan._id } });
    await DailyRoutine.insertMany(days.map((day) => ({
        userId, routinePlanId: plan._id, routineGroupId: String(plan._id), date: dateKey(addDays(startDate, day.dayNumber - 1)),
        dayNumber: day.dayNumber, totalDays, morningProducts: day.morningProducts, eveningProducts: day.eveningProducts,
    })));
    return plan;
};

const addDays = (value, days) => {
    const date = new Date(`${dateKey(value)}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date;
};

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
        .populate('routinePlanId', 'explanation stepReasons externalSuggestions title totalDays currentDay')
        .lean();
    return serializeRoutine(routine);
};

const getActivePlan = async (userId) => {
    const plan = await RoutinePlan.findOne({ userId, status: 'active' })
        .populate('days.morningProducts days.eveningProducts')
        .lean();
    if (!plan) return null;
    const today = dateKey();
    const start = new Date(`${plan.startDate}T00:00:00.000Z`);
    const current = Math.max(1, Math.floor((new Date(`${today}T00:00:00.000Z`) - start) / 86400000) + 1);
    return { ...plan, currentDay: Math.min(current, plan.totalDays) };
};

const getRoutineHistory = async (userId) => RoutinePlan.find({ userId, status: { $in: ['completed', 'cancelled'] } })
    .sort({ updatedAt: -1 })
    .populate('days.morningProducts days.eveningProducts')
    .lean();

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
                ...(payload.routinePlanId !== undefined ? { routinePlanId: payload.routinePlanId } : {}),
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
    getActivePlan,
    getRoutineHistory,
    upsertRoutine,
    checkIn,
    undoCheckIn,
    normalizeConditions,
    recommendRoutine,
    createRoutinePlan,
    validateRoutineProducts,
};
