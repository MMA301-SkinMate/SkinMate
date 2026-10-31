const TreatmentPlan = require('../models/TreatmentPlan');
const DailyRoutine = require('../models/DailyRoutine');
const Collection = require('../models/Collection');
const User = require('../models/User');
const Ingredient = require('../models/Ingredient');
const { reEvaluateCloset } = require('../utils/scoreCalculator');
const defaultIngredients = require('../seeder/ingredientData.json');

/**
 * Lấy Cẩm nang Do's & Don'ts theo loại da và dị ứng (UC 6, UC 10, UC 40)
 */
const getSkinGuide = async (skinType = 'normal', allergies = []) => {
    const normalizedType = skinType.toLowerCase();
    const normalizedAllergies = (allergies || []).map(a => a.toLowerCase().trim());

    // Tìm từ DB hoặc fallback vào JSON seeder
    let ingredients = await Ingredient.find();
    if (!ingredients || ingredients.length === 0) {
        ingredients = defaultIngredients;
    }

    const dos = [];
    const donts = [];

    ingredients.forEach(item => {
        // Kiểm tra Do's
        if (item.dos && item.dos.includes(normalizedType)) {
            // Không được trùng với dị ứng của user
            const isAllergic = normalizedAllergies.some(a => 
                item.name.toLowerCase().includes(a) || (item.aliases || []).some(al => al.toLowerCase().includes(a))
            );
            if (!isAllergic) {
                dos.push({
                    name: item.name,
                    description: item.description,
                    category: item.category,
                    targetConcerns: item.targetConcerns,
                });
            }
        }

        // Kiểm tra Don'ts
        let isDont = false;
        let reason = '';
        if (item.donts && item.donts.includes(normalizedType)) {
            isDont = true;
            reason = `Không phù hợp cho da ${skinType}`;
        }
        // Nếu user dị ứng
        const allergicMatch = normalizedAllergies.find(a => 
            a && (item.name.toLowerCase().includes(a) || (item.aliases || []).some(al => al.toLowerCase().includes(a)))
        );
        if (allergicMatch) {
            isDont = true;
            reason = `Chứa thành phần dị ứng đã khai báo (${allergicMatch})`;
        }

        if (isDont) {
            donts.push({
                name: item.name,
                description: item.description,
                reason,
                category: item.category,
            });
        }
    });

    return {
        skinType,
        allergies,
        dos,
        donts,
        updatedAt: new Date(),
    };
};

/**
 * Kiểm tra xem sản phẩm có bị hết hạn không (theo hạn mở nắp PAO hoặc HSD)
 * Bỏ qua ngay cả khi continueAfterExpiry = true (Theo UC 8)
 */
const isProductUsable = (product) => {
    const now = new Date();
    // 1. Kiểm tra expirationDate
    if (product.expirationDate && new Date(product.expirationDate) < now) {
        return false;
    }
    // 2. Kiểm tra PAO
    if (product.openedDate && product.paoDays) {
        const expiryFromOpen = new Date(product.openedDate);
        expiryFromOpen.setDate(expiryFromOpen.getDate() + product.paoDays);
        if (expiryFromOpen < now) {
            return false;
        }
    }
    return true;
};

/**
 * Gợi ý sản phẩm bên ngoài tủ đồ nếu tủ đồ bị thiếu (UC 8)
 */
const getExternalProductSuggestions = (missingCategory, concern) => {
    const externalCatalog = {
        cleanser: {
            name: 'Cetaphil Gentle Skin Cleanser',
            type: 'cleanser',
            instruction: 'Massage nhẹ nhàng 60s trên nền da ẩm vào buổi sáng.',
            ingredient: 'Centella Asiatica / Niacinamide'
        },
        toner: {
            name: 'Skin1004 Madagascar Centella Toning Toner',
            type: 'toner',
            instruction: 'Vỗ 2-3 lớp mỏng nhẹ để cân bằng độ ẩm tức thì.',
            ingredient: 'Centella Asiatica (Rau má)'
        },
        treatment: {
            acne: {
                name: 'Klenzit MS Adapalene 0.1%',
                type: 'treatment',
                instruction: 'Chấm điểm mỏng vào các vùng mụn viêm vào buổi tối.',
                ingredient: 'Retinol / Adapalene'
            },
            pores: {
                name: 'Paula’s Choice 2% BHA Liquid Exfoliant',
                type: 'treatment',
                instruction: 'Dùng bông lau nhẹ vùng mũi trán cách ngày.',
                ingredient: 'Salicylic Acid (BHA)'
            },
            default: {
                name: 'The Ordinary Niacinamide 10% + Zinc 1%',
                type: 'treatment',
                instruction: 'Nhỏ 3 giọt massage toàn mặt giúp kiềm dầu và mờ thâm.',
                ingredient: 'Niacinamide (Vitamin B3)'
            }
        },
        moisturizer: {
            name: 'La Roche-Posay Cicaplast Baume B5+',
            type: 'moisturizer',
            instruction: 'Khóa ẩm một lớp mỏng nhẹ sau bước serum để phục hồi da.',
            ingredient: 'Panthenol (Vitamin B5)'
        },
        sunscreen: {
            name: 'Anessa Perfect UV Sunscreen Skincare Milk SPF50+',
            type: 'sunscreen',
            instruction: 'Thoa đủ lượng 2 đốt ngón tay mỗi sáng trước khi ra ngoài 20 phút.',
            ingredient: 'Zinc Oxide'
        }
    };

    if (missingCategory === 'treatment') {
        return externalCatalog.treatment[concern] || externalCatalog.treatment.default;
    }
    return externalCatalog[missingCategory] || {
        name: 'Kem dưỡng ẩm phục hồi dịu nhẹ',
        type: 'moisturizer',
        instruction: 'Thoa đều toàn mặt để giữ màng ẩm tự nhiên.',
        ingredient: 'Ceramide'
    };
};

/**
 * Gợi ý chuỗi Routine 7 ngày cải thiện da (UC 8)
 */
const generateRoutinePlan = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    const skinProfile = user.skinProfile || {};
    const skinType = (skinProfile.skinType || 'normal').toLowerCase();
    const concerns = (skinProfile.currentConcerns || []).map(c => c.toLowerCase());

    // Lấy tủ đồ của user (chỉ lấy status = 'active' và CHƯA hết hạn)
    const allProducts = await Collection.find({ userId, status: 'active' });
    const usableProducts = allProducts.filter(p => isProductUsable(p));

    // Phân loại sản phẩm trong tủ đồ
    const cleansers = usableProducts.filter(p => ['cleanser'].includes(p.productType));
    const toners = usableProducts.filter(p => ['toner', 'essences'].includes(p.productType));
    const treatments = usableProducts.filter(p => ['serum', 'treatment', 'oil', 'exfoliant'].includes(p.productType));
    const moisturizers = usableProducts.filter(p => ['cream', 'moisturizer'].includes(p.productType));
    const sunscreens = usableProducts.filter(p => ['sunscreen'].includes(p.productType));

    // Tạo TreatmentPlan mới dạng Draft
    const title = concerns.length > 0
        ? `Chuỗi Routine 7 Ngày Cải Thiện ${concerns.join(', ')}`
        : 'Chuỗi Routine 7 Ngày Cấp Ẩm Căng Bóng';

    const plan = new TreatmentPlan({
        userId,
        title,
        goal: 'Cải thiện tình trạng da & phục hồi hàng rào ẩm tự nhiên',
        skinTypeTarget: skinType,
        durationDays: 7,
        status: 'draft',
        isOriginalSuggested: true,
    });
    await plan.save();

    // Tạo lộ trình cho 7 ngày
    const createdDailyRoutines = [];
    for (let day = 1; day <= 7; day++) {
        const morningSteps = [];
        const eveningSteps = [];

        // --- BUỔI SÁNG (AM) ---
        // Bước 1: Cleanser
        if (cleansers.length > 0) {
            morningSteps.push({
                stepNumber: 1,
                stepName: 'Làm sạch • Cleanser',
                productType: 'cleanser',
                productId: cleansers[0]._id,
                productName: cleansers[0].productName,
                instruction: 'Thoa trên da ẩm, massage nhẹ nhàng 60s để làm sạch bã nhờn đêm qua.',
                isExternalSuggestion: false,
            });
        } else {
            const ext = getExternalProductSuggestions('cleanser');
            morningSteps.push({
                stepNumber: 1,
                stepName: 'Làm sạch • Cleanser (Gợi ý thêm)',
                productType: ext.type,
                productName: ext.name,
                instruction: ext.instruction,
                isExternalSuggestion: true,
                activeIngredient: ext.ingredient,
            });
        }

        // Bước 2: Toner
        if (toners.length > 0) {
            morningSteps.push({
                stepNumber: 2,
                stepName: 'Cân bằng & Cấp ẩm • Toner',
                productType: 'toner',
                productId: toners[0]._id,
                productName: toners[0].productName,
                instruction: 'Vỗ 2-3 lớp mỏng nhẹ để da ngậm nước sâu.',
                isExternalSuggestion: false,
            });
        }

        // Bước 3: Serum / Moisturizer nhẹ buổi sáng
        if (moisturizers.length > 0) {
            morningSteps.push({
                stepNumber: morningSteps.length + 1,
                stepName: 'Khóa ẩm mỏng nhẹ • Moisturizer',
                productType: 'moisturizer',
                productId: moisturizers[0]._id,
                productName: moisturizers[0].productName,
                instruction: 'Lấy lượng bằng hạt đậu, thoa đều giúp giữ ẩm cả ngày.',
                isExternalSuggestion: false,
            });
        }

        // Bước 4: Chống nắng Sunscreen
        if (sunscreens.length > 0) {
            morningSteps.push({
                stepNumber: morningSteps.length + 1,
                stepName: 'Bảo vệ màng da • Sunscreen',
                productType: 'sunscreen',
                productId: sunscreens[0]._id,
                productName: sunscreens[0].productName,
                instruction: 'Thoa trước khi ra ngoài 20 phút để chống tác hại UV.',
                isExternalSuggestion: false,
            });
        } else {
            const extSun = getExternalProductSuggestions('sunscreen');
            morningSteps.push({
                stepNumber: morningSteps.length + 1,
                stepName: 'Bảo vệ màng da • Sunscreen (Gợi ý thêm)',
                productType: extSun.type,
                productName: extSun.name,
                instruction: extSun.instruction,
                isExternalSuggestion: true,
                activeIngredient: extSun.ingredient,
            });
        }

        // --- BUỔI TỐI (PM) ---
        // Bước 1: Làm sạch sâu
        eveningSteps.push({
            stepNumber: 1,
            stepName: 'Làm sạch sâu • Cleanser',
            productType: 'cleanser',
            productId: cleansers[0]?._id || null,
            productName: cleansers[0]?.productName || 'Sữa rửa mặt dịu nhẹ',
            instruction: 'Rửa sạch bụi bẩn và dầu thừa tích tụ trong ngày.',
            isExternalSuggestion: !cleansers[0],
        });

        // Bước 2: Cân bằng
        if (toners.length > 0) {
            eveningSteps.push({
                stepNumber: 2,
                stepName: 'Cân bằng màng ẩm • Toner',
                productType: 'toner',
                productId: toners[0]._id,
                productName: toners[0].productName,
                instruction: 'Thấm ra bông hoặc vỗ trực tiếp bằng tay.',
                isExternalSuggestion: false,
            });
        }

        // Bước 3: Treatment / Serum cải thiện
        if (treatments.length > 0) {
            eveningSteps.push({
                stepNumber: eveningSteps.length + 1,
                stepName: 'Đặc trị cải thiện • Treatment',
                productType: treatments[0].productType,
                productId: treatments[0]._id,
                productName: treatments[0].productName,
                instruction: 'Thoa 3-4 giọt tập trung vào vùng da cần cải thiện.',
                isExternalSuggestion: false,
            });
        } else {
            // Trong tủ đồ không có sản phẩm cải thiện => Gợi ý sản phẩm bên ngoài (UC 8)
            const targetConcern = concerns[0] || 'pores';
            const extTreat = getExternalProductSuggestions('treatment', targetConcern);
            eveningSteps.push({
                stepNumber: eveningSteps.length + 1,
                stepName: 'Đặc trị phục hồi • Treatment (Gợi ý bên ngoài tủ)',
                productType: extTreat.type,
                productName: extTreat.name,
                instruction: extTreat.instruction,
                isExternalSuggestion: true,
                activeIngredient: extTreat.ingredient,
            });
        }

        // Bước 4: Khóa ẩm ban đêm
        if (moisturizers.length > 0) {
            eveningSteps.push({
                stepNumber: eveningSteps.length + 1,
                stepName: 'Khóa ẩm phục hồi ban đêm • Cream',
                productType: moisturizers[0].productType,
                productId: moisturizers[0]._id,
                productName: moisturizers[0].productName,
                instruction: 'Khóa ẩm toàn bộ dưỡng chất để da tái tạo khi ngủ.',
                isExternalSuggestion: false,
            });
        } else {
            const extMoist = getExternalProductSuggestions('moisturizer');
            eveningSteps.push({
                stepNumber: eveningSteps.length + 1,
                stepName: 'Khóa ẩm ban đêm • Cream (Gợi ý thêm)',
                productType: extMoist.type,
                productName: extMoist.name,
                instruction: extMoist.instruction,
                isExternalSuggestion: true,
                activeIngredient: extMoist.ingredient,
            });
        }

        const daily = new DailyRoutine({
            planId: plan._id,
            userId,
            dayNumber: day,
            morningSteps,
            eveningSteps,
            isDraft: true,
        });
        await daily.save();
        createdDailyRoutines.push(daily);
    }

    return {
        plan,
        dailyRoutines: createdDailyRoutines,
        totalDays: 7,
    };
};

/**
 * Kích hoạt hoặc lưu nháp gợi ý chuỗi routine (UC 9)
 */
const activateRoutinePlan = async (userId, planId) => {
    // Nếu kích hoạt, các plan active trước đó sẽ được chuyển sang completed hoặc cancelled
    await TreatmentPlan.updateMany({ userId, status: 'active' }, { status: 'cancelled' });

    const plan = await TreatmentPlan.findById(planId);
    if (!plan) throw new Error('Không tìm thấy phác đồ routine');

    plan.status = 'active';
    plan.startDate = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (plan.durationDays || 7));
    plan.endDate = end;
    await plan.save();

    await DailyRoutine.updateMany({ planId }, { isDraft: false });
    return plan;
};

const dismissRoutineSuggestion = async (planId) => {
    // Lưu nháp để sau này người dùng có thể lấy ra lại (UC 9)
    const plan = await TreatmentPlan.findById(planId);
    if (!plan) throw new Error('Không tìm thấy phác đồ routine');
    plan.status = 'draft';
    await plan.save();
    return { message: 'Đã lưu bản nháp routine thành công' };
};

/**
 * Thiết lập lại hồ sơ da và xử lý 3 tác động (UC 40):
 * 1. Cập nhật Do's & Don'ts từ Skin_Dictionary
 * 2. Đánh giá lại toàn bộ tủ đồ (reEvaluateCloset)
 * 3. Cảnh báo rẽ nhánh nếu có TreatmentPlan đang active
 */
const updateSkinProfileWithImpact = async (userId, newProfile, forceReset = false) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Không tìm thấy người dùng');

    // 1. Kiểm tra phác đồ đang chạy (Active Treatment Plan)
    const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
    if (activePlan && !forceReset) {
        return {
            hasActivePlan: true,
            activePlanId: activePlan._id,
            warningMessage: 'Việc thay đổi hồ sơ da sẽ hủy bỏ phác đồ điều trị hiện tại và hệ thống cần tính toán lại lộ trình mới. Bạn có chắc chắn không?',
        };
    }

    // Nếu người dùng đồng ý forceReset, hủy phác đồ đang chạy
    if (activePlan && forceReset) {
        activePlan.status = 'cancelled';
        await activePlan.save();
    }

    // 2. Cập nhật hồ sơ da
    user.skinProfile = {
        skinType: newProfile.skinType || user.skinProfile?.skinType,
        allergies: newProfile.allergies !== undefined ? newProfile.allergies : user.skinProfile?.allergies,
        currentConcerns: newProfile.currentConcerns !== undefined ? newProfile.currentConcerns : user.skinProfile?.currentConcerns,
    };
    await user.save();

    // 3. Đánh giá lại tủ đồ (Re-evaluate Closet)
    const closetResult = await reEvaluateCloset(userId, user.skinProfile);

    // 4. Tra cứu lại Cẩm nang Do's & Don'ts
    const guide = await getSkinGuide(user.skinProfile.skinType, user.skinProfile.allergies);

    return {
        success: true,
        user,
        popupMessage: 'Hồ sơ da của bạn đã thay đổi. Hệ thống sẽ đánh giá lại mức độ phù hợp của các sản phẩm trong tủ đồ.',
        reEvaluatedProductsCount: closetResult.updatedCount,
        closetSummary: closetResult.reEvaluatedList,
        guide,
    };
};

/**
 * Lấy lịch sử chuỗi Routine (UC 41)
 */
const getRoutineHistory = async (userId) => {
    const plans = await TreatmentPlan.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
    return plans;
};

/**
 * Lấy chi tiết chuỗi routine theo ngày và buổi sáng/tối (UC 9, UC 42)
 */
const getRoutineDetail = async (planId) => {
    const plan = await TreatmentPlan.findById(planId).lean();
    if (!plan) throw new Error('Không tìm thấy chuỗi routine');

    const dailyRoutines = await DailyRoutine.find({ planId })
        .sort({ dayNumber: 1 })
        .lean();

    return {
        plan,
        dailyRoutines,
    };
};

/**
 * Kiểm tra đối chiếu trước khi Copy chuỗi routine cũ (UC 43)
 */
const checkCopyRoutineCompatibility = async (userId, sourcePlanId) => {
    const sourcePlan = await TreatmentPlan.findById(sourcePlanId);
    if (!sourcePlan) throw new Error('Không tìm thấy chuỗi routine nguồn');

    const dailyRoutines = await DailyRoutine.find({ planId: sourcePlanId });
    const user = await User.findById(userId);

    // Kiểm tra xem hiện tại user có đang dùng chuỗi routine nào không
    const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });

    // Quét đối chiếu mảng sản phẩm trong chuỗi cũ với tủ đồ hiện tại (tab Đang sử dụng)
    const closetProducts = await Collection.find({ userId, status: 'active' });
    const usableClosetProducts = closetProducts.filter(p => isProductUsable(p));

    const missingProducts = [];
    const replacedProducts = [];

    // Duyệt qua tất cả các bước trong routine nguồn
    const checkedProductIds = new Set();
    dailyRoutines.forEach(daily => {
        const allSteps = [...(daily.morningSteps || []), ...(daily.eveningSteps || [])];
        allSteps.forEach(step => {
            if (step.productId) {
                const pIdStr = step.productId.toString();
                if (checkedProductIds.has(pIdStr)) return;
                checkedProductIds.add(pIdStr);

                // Kiểm tra xem sản phẩm có trong tủ đồ usable không
                const exists = usableClosetProducts.find(cp => cp._id.toString() === pIdStr);
                if (!exists) {
                    // Thiếu sản phẩm => Tìm sản phẩm thay thế có cùng hoạt chất active hoặc cùng category
                    const replacement = usableClosetProducts.find(cp => {
                        if (step.productType && cp.productType === step.productType) return true;
                        if (step.activeIngredient && (cp.ingredients || []).some(i => i.toLowerCase().includes(step.activeIngredient.toLowerCase()))) return true;
                        return false;
                    });

                    missingProducts.push({
                        originalName: step.productName,
                        productType: step.productType,
                        replacement: replacement ? {
                            id: replacement._id,
                            name: replacement.productName,
                            productType: replacement.productType,
                        } : null,
                        message: replacement
                            ? `Bạn đã hết sản phẩm [${step.productName}]. Hệ thống sẽ thay thế bằng sản phẩm tương đương [${replacement.productName}] trong tủ đồ của bạn.`
                            : `Bạn đã hết sản phẩm [${step.productName}] và không có sản phẩm thay thế trong tủ đồ.`,
                    });
                }
            }
        });
    });

    return {
        hasActiveRoutine: !!activePlan,
        activePlanTitle: activePlan?.title || null,
        missingProducts,
        canCopy: true,
    };
};

/**
 * Thực hiện Copy chuỗi routine cũ thành chuỗi mới (UC 43)
 */
const executeCopyRoutine = async (userId, sourcePlanId, { userChoice = 'start_now' }) => {
    const compatibility = await checkCopyRoutineCompatibility(userId, sourcePlanId);
    const sourcePlan = await TreatmentPlan.findById(sourcePlanId);
    const sourceDailies = await DailyRoutine.find({ planId: sourcePlanId });

    if (userChoice === 'start_now') {
        // Hủy bỏ routine cũ đang chạy
        await TreatmentPlan.updateMany({ userId, status: 'active' }, { status: 'cancelled' });
    }

    // Tạo bản copy mới
    const newPlan = new TreatmentPlan({
        userId,
        title: `Sao chép - ${sourcePlan.title}`,
        goal: sourcePlan.goal,
        skinTypeTarget: sourcePlan.skinTypeTarget,
        durationDays: sourcePlan.durationDays,
        status: userChoice === 'start_now' ? 'active' : 'draft',
        startDate: userChoice === 'start_now' ? new Date() : null,
        sourceRoutineId: sourcePlan._id,
        isOriginalSuggested: false,
    });
    await newPlan.save();

    // Map sản phẩm thay thế
    const replacementMap = {};
    compatibility.missingProducts.forEach(mp => {
        if (mp.replacement) {
            replacementMap[mp.originalName] = mp.replacement;
        }
    });

    for (const d of sourceDailies) {
        const replaceStep = (step) => {
            const repl = replacementMap[step.productName];
            if (repl) {
                return {
                    ...step.toObject(),
                    productId: repl.id,
                    productName: repl.name,
                    productType: repl.productType,
                };
            }
            return step.toObject();
        };

        const newDaily = new DailyRoutine({
            planId: newPlan._id,
            userId,
            dayNumber: d.dayNumber,
            morningSteps: (d.morningSteps || []).map(replaceStep),
            eveningSteps: (d.eveningSteps || []).map(replaceStep),
            isDraft: userChoice !== 'start_now',
        });
        await newDaily.save();
    }

    return {
        success: true,
        newPlan,
        message: userChoice === 'start_now' ? 'Đã bắt đầu áp dụng chuỗi routine sao chép!' : 'Đã lưu chuỗi routine sao chép vào danh sách chờ.',
    };
};

/**
 * Chuẩn bị dữ liệu chuỗi routine để chia sẻ lên cộng đồng (UC 44)
 */
const prepareRoutineForShare = async (planId) => {
    const plan = await TreatmentPlan.findById(planId).lean();
    if (!plan) throw new Error('Không tìm thấy chuỗi routine');

    const dailies = await DailyRoutine.find({ planId }).sort({ dayNumber: 1 }).lean();

    // Tóm tắt các bước sáng & tối đại diện
    const morningFlow = dailies[0]?.morningSteps?.map(s => s.productName) || [];
    const eveningFlow = dailies[0]?.eveningSteps?.map(s => s.productName) || [];

    return {
        routineId: plan._id,
        title: plan.title,
        goal: plan.goal,
        durationDays: plan.durationDays,
        morningFlow,
        eveningFlow,
        dailiesSummary: dailies.map(d => ({
            dayNumber: d.dayNumber,
            morningCount: d.morningSteps?.length || 0,
            eveningCount: d.eveningSteps?.length || 0,
        })),
    };
};

module.exports = {
    getSkinGuide,
    generateRoutinePlan,
    activateRoutinePlan,
    dismissRoutineSuggestion,
    updateSkinProfileWithImpact,
    getRoutineHistory,
    getRoutineDetail,
    checkCopyRoutineCompatibility,
    executeCopyRoutine,
    prepareRoutineForShare,
};
