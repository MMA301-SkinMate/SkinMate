const DailyRoutine = require('../models/DailyRoutine');
const TreatmentPlan = require('../models/TreatmentPlan');
const Collection = require('../models/Collection');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');
const {
  CONFLICT_MATRIX,
  CONDITION_DICTIONARY,
  matchesAny,
  normalizeStr,
} = require('../utils/scoreCalculator');

// Format date as YYYY-MM-DD
const getTodayDateStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * 11. UI Home Data
 */
const getHomeData = async (userId) => {
  const user = await User.findById(userId).populate('activeTreatmentPlan');
  const todayStr = getTodayDateStr();

  // Find or generate today's routine
  let dailyRoutine = await DailyRoutine.findOne({
    user: userId,
    date: todayStr,
  }).populate('morningSteps.product eveningSteps.product');

  if (!dailyRoutine) {
    dailyRoutine = await analyzeAndGenerateDailyRoutine(
      userId,
      user.currentConditions || ['Bình thường'],
      todayStr
    );
  }

  // Community posts tailored to user skin type
  const communityPosts = await CommunityPost.find({
    isHidden: false,
    $or: [
      { skinType: user.skinType },
      { skinType: 'Da_Hon_Hop' },
    ],
  })
    .sort({ likesCount: -1 })
    .limit(3)
    .populate('author', 'name avatar');

  return {
    profile: {
      name: user.name,
      avatar: user.avatar,
      skinType: user.skinType,
      allergies: user.allergies,
      streak: user.streak,
    },
    uvIndex: {
      value: 6.2,
      warning: 'UV 6.2 - Nhớ bôi KCN phổ rộng',
      level: 'Cao',
    },
    checkinWidget: {
      hasCheckedIn: dailyRoutine && dailyRoutine.skinConditions.length > 0,
      currentConditions: dailyRoutine ? dailyRoutine.skinConditions : user.currentConditions,
      canUndo:
        dailyRoutine &&
        dailyRoutine.undoExpiresAt &&
        new Date() < new Date(dailyRoutine.undoExpiresAt),
    },
    todayRoutine: dailyRoutine,
    communityPosts,
  };
};

/**
 * 13. Check-in tình trạng da hàng ngày
 * Hỗ trợ 5 chips: Bình thường, Khô rát, Kích ứng, Nổi mụn, Bóng dầu
 * Logic: nếu chọn 'Bình thường' thì bỏ các lựa chọn khác; nếu chọn các trạng thái xấu thì bỏ 'Bình thường'
 * Tạo thông báo đếm ngược 10 giây để Undo
 */
const submitCheckin = async (userId, selectedConditions) => {
  let conditions = Array.isArray(selectedConditions) ? selectedConditions : [selectedConditions];

  // Logic chuẩn nghiệp vụ:
  if (conditions.includes('Bình thường')) {
    if (conditions.length > 1) {
      // User vừa chọn Bình thường cùng với cái khác -> giữ lại cái xấu nhất hoặc giữ Bình thường tùy hành động
      conditions = ['Bình thường'];
    }
  } else {
    // Nếu chọn các trạng thái xấu -> tự động bỏ 'Bình thường'
    conditions = conditions.filter((c) => c !== 'Bình thường');
    if (conditions.length === 0) {
      conditions = ['Bình thường'];
    }
  }

  const todayStr = getTodayDateStr();
  const undoExpiresAt = new Date(Date.now() + 10 * 1000); // 10 giây đếm ngược hoàn tác

  // Update user condition and streak
  const user = await User.findById(userId);
  user.currentConditions = conditions;

  const now = new Date();
  const lastDate = user.lastCheckinDate ? new Date(user.lastCheckinDate) : null;
  if (!lastDate || lastDate.toDateString() !== now.toDateString()) {
    user.streak = (user.streak || 0) + 1;
    user.lastCheckinDate = now;
  }
  await user.save();

  // Kích hoạt ngay Thuật toán Phân tích tình trạng da và cập nhật Daily Routine (Mục 14)
  const updatedDaily = await analyzeAndGenerateDailyRoutine(
    userId,
    conditions,
    todayStr,
    undoExpiresAt
  );

  return {
    success: true,
    message: 'Check-in thành công. Hệ thống đã tối ưu hóa Daily Routine hôm nay!',
    conditions,
    undoExpiresAt,
    dailyRoutine: updatedDaily,
  };
};

/**
 * Undo check-in trong vòng 10 giây
 */
const undoCheckin = async (userId) => {
  const todayStr = getTodayDateStr();
  const daily = await DailyRoutine.findOne({ user: userId, date: todayStr });

  if (!daily || !daily.undoExpiresAt || new Date() > new Date(daily.undoExpiresAt)) {
    throw new Error('Đã quá thời gian 10 giây để hoàn tác');
  }

  // Reset to default 'Bình thường'
  daily.skinConditions = ['Bình thường'];
  daily.undoExpiresAt = null;
  daily.isOverridden = false;
  daily.overrideReason = '';
  await daily.save();

  const user = await User.findById(userId);
  user.currentConditions = ['Bình thường'];
  await user.save();

  return await analyzeAndGenerateDailyRoutine(userId, ['Bình thường'], todayStr, null);
};

/**
 * 14. Phân tích tình trạng da và Daily Routine (Thuật toán OVERRIDE)
 * - Kiểm tra user có đang kích hoạt TreatmentPlan không (ví dụ Ngày 3/14)
 * - Nếu hôm nay bôi BHA/AHA/Retinol nhưng da "Khô rát" hoặc "Kích ứng":
 *   -> Ghi đè (OVERRIDE): hủy BHA/Retinol, thay bằng B5/Ceramide, lùi lịch 1 ngày
 *   -> Tìm sản phẩm sẵn trong tủ đồ (loại bỏ hết hạn), nếu thiếu gọi gợi ý ngoài tủ đồ
 */
const analyzeAndGenerateDailyRoutine = async (
  userId,
  skinConditions,
  dateStr = getTodayDateStr(),
  undoExpiresAt = null
) => {
  const user = await User.findById(userId);
  const activePlan = await TreatmentPlan.findOne({
    user: userId,
    status: 'active',
  }).populate('schedule.morningSteps.product schedule.eveningSteps.product');

  // Lấy danh sách sản phẩm trong tủ đồ còn hạn sử dụng (loại bỏ triệt để sản phẩm hết hạn kể cả khi user cố tình dùng tiếp)
  const closetProducts = await Collection.find({
    user: userId,
    status: 'active',
    $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }],
    isExpiredAcknowledged: { $ne: true },
  });

  const isBadSkinCondition =
    skinConditions.includes('Khô rát') ||
    skinConditions.includes('Kích ứng') ||
    skinConditions.includes('Khô_Rát') ||
    skinConditions.includes('Kích_Ứng');

  let isOverridden = false;
  let overrideReason = '';

  let morningSteps = [];
  let eveningSteps = [];
  let dayInPlan = 1;

  if (activePlan) {
    dayInPlan = activePlan.currentDay || 1;
    const currentDaySchedule =
      activePlan.schedule.find((s) => s.day === dayInPlan) || activePlan.schedule[0];

    if (currentDaySchedule) {
      // Clone steps
      morningSteps = currentDaySchedule.morningSteps.map((s) => s.toObject());
      eveningSteps = currentDaySchedule.eveningSteps.map((s) => s.toObject());

      // Kiểm tra OVERRIDE nếu da đang Khô rát / Kích ứng
      if (isBadSkinCondition) {
        // Quét bước đặc trị buổi tối xem có chứa BHA / AHA / Retinol không
        const harshIngredients = ['bha', 'aha', 'retinol', 'salicylic acid', 'glycolic acid'];
        let needsOverride = false;
        let originalHarshProduct = '';

        for (const step of eveningSteps) {
          const prod = step.product || step.customProduct;
          const ingList = (prod?.ingredients || []).concat(prod?.activeIngredients || []);
          const hasHarsh = ingList.some((ing) =>
            harshIngredients.some((h) => normalizeStr(ing).includes(h))
          );

          if (hasHarsh || (step.category === 'treatment' && !normalizeStr(step.stepName).includes('b5'))) {
            needsOverride = true;
            originalHarshProduct = prod?.name || prod?.productName || 'BHA / Hoạt chất đặc trị';

            // Tìm sản phẩm phục hồi (B5 / Ceramide / Rau má) trong tủ đồ
            const soothingProd = closetProducts.find((p) => {
              const pIngs = (p.ingredients || []).map(normalizeStr);
              return pIngs.some((i) => i.includes('b5') || i.includes('panthenol') || i.includes('ceramide') || i.includes('centella'));
            });

            if (soothingProd) {
              step.product = soothingProd._id;
              step.customProduct = {
                name: soothingProd.productName,
                brand: soothingProd.brand,
                icon: soothingProd.icon || 'bottle',
              };
              step.isSuggestedOutside = false;
              step.reason = `Thuật toán tự động ghi đè: Thay thế ${originalHarshProduct} bằng Serum phục hồi ${soothingProd.productName} vì da đang ${skinConditions.join(', ')}`;
            } else {
              // Thiếu trong tủ đồ -> Gợi ý bên ngoài
              step.product = null;
              step.customProduct = {
                name: 'Serum La Roche-Posay Hyalu B5',
                brand: 'La Roche-Posay',
                icon: 'bottle',
              };
              step.isSuggestedOutside = true;
              step.reason = `Tủ đồ của bạn thiếu hoạt chất làm dịu. Gợi ý thêm Serum B5 La Roche-Posay để phục hồi nền da ${skinConditions.join(', ')}`;
            }
          }
        }

        if (needsOverride) {
          isOverridden = true;
          overrideReason = `Phát hiện da ${skinConditions.join(', ')}: Đã tạm hoãn hoạt chất mạnh, ưu tiên phục hồi và lùi toàn bộ lịch trình 1 ngày.`;

          // Ghi lại lịch sử override và LÙI LỊCH 1 NGÀY cho activePlan
          activePlan.isOverridden = true;
          activePlan.overrideHistory.push({
            date: new Date(),
            day: dayInPlan,
            triggerCondition: skinConditions,
            originalProduct: originalHarshProduct,
            replacedProduct: 'Serum Phục Hồi B5 / Ceramide',
            shiftDays: 1,
            message: overrideReason,
          });

          // Thực hiện lùi toàn bộ routine từ dayInPlan về sau xuống 1 ngày
          activePlan.totalDays = (activePlan.totalDays || 14) + 1;
          activePlan.schedule.forEach((s) => {
            if (s.day >= dayInPlan) {
              s.day += 1;
            }
          });
          // Chèn ngày phục hồi vào dayInPlan hiện tại
          activePlan.schedule.push({
            day: dayInPlan,
            morningSteps,
            eveningSteps,
          });
          activePlan.schedule.sort((a, b) => a.day - b.day);

          await activePlan.save();
        }
      }
    }
  }

  // Nếu chưa có TreatmentPlan, tự động xây dựng Daily Routine 5 bước chuẩn y khoa
  if (morningSteps.length === 0 || eveningSteps.length === 0) {
    const default5Steps = buildDefault5Steps(closetProducts, skinConditions, user.skinType);
    morningSteps = default5Steps.morning;
    eveningSteps = default5Steps.evening;
  }

  // Gán Dynamic AI Reason cho từng bước
  enrichStepReasons(morningSteps, skinConditions, 'morning');
  enrichStepReasons(eveningSteps, skinConditions, 'evening');

  // Lưu hoặc cập nhật DailyRoutine trong DB
  let daily = await DailyRoutine.findOne({ user: userId, date: dateStr });
  if (!daily) {
    daily = new DailyRoutine({
      user: userId,
      date: dateStr,
      skinConditions,
      undoExpiresAt,
      morningSteps,
      eveningSteps,
      treatmentPlanRef: activePlan ? activePlan._id : null,
      dayInPlan,
      isOverridden,
      overrideReason,
    });
  } else {
    daily.skinConditions = skinConditions;
    if (undoExpiresAt !== undefined) daily.undoExpiresAt = undoExpiresAt;
    daily.morningSteps = morningSteps;
    daily.eveningSteps = eveningSteps;
    daily.treatmentPlanRef = activePlan ? activePlan._id : null;
    daily.dayInPlan = dayInPlan;
    daily.isOverridden = isOverridden;
    daily.overrideReason = overrideReason;
  }

  await daily.save();
  return await DailyRoutine.findById(daily._id).populate('morningSteps.product eveningSteps.product');
};

/**
 * Xây dựng chu trình 5 bước chuẩn y khoa
 * Bước 1: Làm sạch
 * Bước 2: Cân bằng
 * Bước 3: Đặc trị
 * Bước 4: Dưỡng / Phục hồi
 * Bước 5: Bảo vệ (KCN sáng)
 */
function buildDefault5Steps(closet, conditions, skinType) {
  const isIrritated = conditions.includes('Kích ứng') || conditions.includes('Khô rát');

  const findProd = (cat) => closet.find((p) => p.category === cat);

  const cleanser = findProd('cleanser') || {
    productName: 'Sữa rửa mặt dịu nhẹ Cetaphil / Simple',
    brand: 'Simple',
    icon: 'bottle',
  };
  const toner = findProd('toner') || {
    productName: 'Nước hoa hồng Klairs Supple Preparation',
    brand: 'Klairs',
    icon: 'bottle',
  };
  const treatment = isIrritated
    ? (findProd('serum') || { productName: 'Serum B5 La Roche-Posay', brand: 'La Roche-Posay', icon: 'bottle' })
    : (findProd('treatment') || findProd('serum') || { productName: 'Tinh chất Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', icon: 'bottle' });
  const moisturizer = findProd('moisturizer') || {
    productName: 'Kem dưỡng ẩm phục hồi Neutrogena Hydro Boost',
    brand: 'Neutrogena',
    icon: 'cream',
  };
  const sunscreen = findProd('sunscreen') || {
    productName: 'Kem chống nắng Anessa Perfect UV Sunscreen',
    brand: 'Anessa',
    icon: 'tube',
  };

  const morning = [
    { stepNumber: 1, stepName: 'Làm sạch', category: 'cleanser', product: cleanser._id || null, customProduct: { name: cleanser.productName, brand: cleanser.brand, icon: 'bottle' } },
    { stepNumber: 2, stepName: 'Cân bằng', category: 'toner', product: toner._id || null, customProduct: { name: toner.productName, brand: toner.brand, icon: 'bottle' } },
    { stepNumber: 3, stepName: 'Đặc trị', category: 'treatment', product: treatment._id || null, customProduct: { name: treatment.productName, brand: treatment.brand, icon: 'bottle' } },
    { stepNumber: 4, stepName: 'Dưỡng / Phục hồi', category: 'moisturizer', product: moisturizer._id || null, customProduct: { name: moisturizer.productName, brand: moisturizer.brand, icon: 'cream' } },
    { stepNumber: 5, stepName: 'Bảo vệ', category: 'sunscreen', product: sunscreen._id || null, customProduct: { name: sunscreen.productName, brand: sunscreen.brand, icon: 'tube' } },
  ];

  const evening = [
    { stepNumber: 1, stepName: 'Làm sạch (Tẩy trang & SRM)', category: 'cleanser', product: cleanser._id || null, customProduct: { name: cleanser.productName, brand: cleanser.brand, icon: 'bottle' } },
    { stepNumber: 2, stepName: 'Cân bằng', category: 'toner', product: toner._id || null, customProduct: { name: toner.productName, brand: toner.brand, icon: 'bottle' } },
    { stepNumber: 3, stepName: 'Đặc trị chuyên sâu', category: 'treatment', product: treatment._id || null, customProduct: { name: treatment.productName, brand: treatment.brand, icon: 'bottle' } },
    { stepNumber: 4, stepName: 'Dưỡng / Khóa ẩm', category: 'moisturizer', product: moisturizer._id || null, customProduct: { name: moisturizer.productName, brand: moisturizer.brand, icon: 'cream' } },
  ];

  return { morning, evening };
}

/**
 * Thêm Dynamic AI Reason cho từng bước
 */
function enrichStepReasons(steps, conditions, session) {
  const condStr = conditions.join(', ');
  steps.forEach((s) => {
    if (!s.reason) {
      if (s.stepName.includes('Làm sạch')) {
        s.reason = `Làm sạch dịu nhẹ giúp loại bỏ bã nhờn mà không làm căng rát da đang ${condStr}`;
      } else if (s.stepName.includes('Cân bằng')) {
        s.reason = `Cân bằng pH ngay sau rửa mặt để tạo tiền đề hấp thụ dưỡng chất`;
      } else if (s.stepName.includes('Đặc trị')) {
        s.reason = conditions.includes('Khô rát') || conditions.includes('Kích ứng')
          ? `Cung cấp hoạt chất phục hồi B5/Ceramide làm dịu cấp tốc nền da ${condStr}`
          : `Tác động sâu vào cồi mụn và kiểm soát dầu thừa hiệu quả`;
      } else if (s.stepName.includes('Dưỡng')) {
        s.reason = `Khóa ẩm màng lipid để ngăn mất nước qua biểu bì suốt buổi ${session === 'morning' ? 'ngày' : 'đêm'}`;
      } else if (s.stepName.includes('Bảo vệ')) {
        s.reason = `Bảo vệ da tuyệt đối trước tia UV (chỉ số 6.2) để tránh tăng sắc tố và sạm nám`;
      }
    }
  });
}

/**
 * Toggle trạng thái hoàn thành bước
 */
const toggleStepCompletion = async (userId, session, stepNumber) => {
  const todayStr = getTodayDateStr();
  const daily = await DailyRoutine.findOne({ user: userId, date: todayStr });
  if (!daily) {
    throw new Error('Chưa tìm thấy daily routine hôm nay');
  }

  const steps = session === 'morning' ? daily.morningSteps : daily.eveningSteps;
  const targetStep = steps.find((s) => s.stepNumber === Number(stepNumber));
  if (!targetStep) {
    throw new Error('Không tìm thấy bước cần cập nhật');
  }

  targetStep.isCompleted = !targetStep.isCompleted;
  await daily.save();

  return daily;
};

/**
 * 17. View chuỗi routine detail
 */
const getTreatmentPlanDetail = async (userId, planId) => {
  let plan;
  if (planId) {
    plan = await TreatmentPlan.findOne({ _id: planId, user: userId }).populate(
      'schedule.morningSteps.product schedule.eveningSteps.product'
    );
  } else {
    plan = await TreatmentPlan.findOne({ user: userId, status: 'active' }).populate(
      'schedule.morningSteps.product schedule.eveningSteps.product'
    );
  }

  if (!plan) {
    // Generate default 14-day template if none
    plan = await createDefaultTreatmentPlan(userId);
  }

  return plan;
};

/**
 * 8 & 9. Gợi ý chuỗi routine (7-14 ngày)
 */
const suggestRoutinePlan = async (userId, condition = 'Bình thường') => {
  const user = await User.findById(userId);
  const isNormal = condition === 'Bình thường';

  const totalDays = isNormal ? 7 : 14;
  const title = isNormal
    ? 'Chuỗi Cấp Ẩm Căng Bóng Da (Chu kỳ 7 ngày)'
    : `Chuỗi Phục Hồi & Cải Thiện Da (${condition} - 14 ngày)`;

  const closet = await Collection.find({ user: userId, status: 'active' });

  // Xây dựng schedule theo ngày
  const schedule = [];
  for (let d = 1; d <= totalDays; d++) {
    const isSpecialTreatmentDay = d % 2 === 1; // Xen kẽ đặc trị
    const steps = buildDefault5Steps(closet, [condition], user.skinType);

    if (!isSpecialTreatmentDay) {
      // Ngày nghỉ đặc trị -> chuyển sang dưỡng phục hồi
      steps.evening.forEach((step) => {
        if (step.category === 'treatment') {
          step.stepName = 'Dưỡng ẩm phục hồi nhẹ';
          step.reason = 'Ngày nghỉ hoạt chất mạnh để da tự cân bằng hàng rào bảo vệ';
        }
      });
    }

    schedule.push({
      day: d,
      morningSteps: steps.morning,
      eveningSteps: steps.evening,
    });
  }

  return {
    title,
    totalDays,
    condition,
    description: isNormal
      ? 'Chu trình hướng tới làn da căng bóng ngậm nước, cấp ẩm sâu lặp lại định kỳ 7 ngày.'
      : `Phác đồ chuyên sâu 14 ngày giúp cải thiện triệt để tình trạng ${condition}.`,
    schedule,
  };
};

/**
 * Áp dụng gợi ý chuỗi routine làm Active Treatment Plan
 */
const applySuggestedPlan = async (userId, planData) => {
  // Archive currently active plan if any
  await TreatmentPlan.updateMany(
    { user: userId, status: 'active' },
    { $set: { status: 'completed' } }
  );

  const newPlan = await TreatmentPlan.create({
    user: userId,
    title: planData.title,
    description: planData.description,
    totalDays: planData.totalDays || 14,
    currentDay: 1,
    status: 'active',
    schedule: planData.schedule,
  });

  const user = await User.findById(userId);
  user.activeTreatmentPlan = newPlan._id;
  await user.save();

  // Cập nhật lại daily routine hôm nay
  await analyzeAndGenerateDailyRoutine(userId, user.currentConditions || ['Bình thường']);

  return newPlan;
};

/**
 * 18. Add/Edit sản phẩm vào chuỗi routine + Check xung đột
 */
const addOrEditProductInPlan = async (userId, planId, payload, force = false) => {
  const plan = await TreatmentPlan.findOne({ _id: planId, user: userId }).populate(
    'schedule.morningSteps.product schedule.eveningSteps.product'
  );
  if (!plan) {
    throw new Error('Không tìm thấy chuỗi routine');
  }

  const { day, session, stepNumber, productData, isNewDay } = payload;
  const user = await User.findById(userId);

  // Check xung đột hoạt chất (Conflict Engine)
  const incomingIngredients = productData.ingredients || [];
  const conflictsFound = [];

  // 1. Kiểm tra với tình trạng da hôm nay
  for (const cond of user.currentConditions || []) {
    const normCond = normalizeStr(cond);
    for (const [key, val] of Object.entries(CONDITION_DICTIONARY)) {
      if (normalizeStr(key) === normCond) {
        for (const ing of incomingIngredients) {
          if (matchesAny(ing, val.banned)) {
            conflictsFound.push({
              type: 'CONDITION_CONFLICT',
              ingredient: ing,
              condition: cond,
              severity: 'HIGH',
              message: `Hoạt chất [${ing}] là cấm kỵ đối với làn da đang [${cond}] của bạn!`,
            });
          }
        }
      }
    }
  }

  // 2. Kiểm tra với các sản phẩm khác trong cùng buổi của ngày đó
  const targetDaySchedule = plan.schedule.find((s) => s.day === Number(day));
  if (targetDaySchedule) {
    const existingSteps = session === 'morning' ? targetDaySchedule.morningSteps : targetDaySchedule.eveningSteps;
    const existingIngredients = [];
    existingSteps.forEach((s) => {
      const p = s.product || s.customProduct || {};
      if (p.ingredients && Array.isArray(p.ingredients)) existingIngredients.push(...p.ingredients);
      if (p.activeIngredients && Array.isArray(p.activeIngredients)) existingIngredients.push(...p.activeIngredients);
    });

    for (const ing of incomingIngredients) {
      for (const [key, bannedList] of Object.entries(CONFLICT_MATRIX)) {
        if (matchesAny(ing, [key])) {
          for (const exIng of existingIngredients) {
            if (matchesAny(exIng, bannedList)) {
              conflictsFound.push({
                type: 'ACTIVE_CONFLICT',
                ingredient: ing,
                conflictsWith: exIng,
                severity: 'CRITICAL',
                message: `Xung đột hoạt chất: [${ing}] không nên dùng chung với [${exIng}] trong cùng buổi skincare vì dễ gây kích ứng và bỏng rát!`,
              });
            }
          }
        }
      }
    }
  }

  if (conflictsFound.length > 0 && !force) {
    return {
      success: false,
      requiresConfirmation: true,
      conflicts: conflictsFound,
      message: 'Phát hiện nguy cơ xung đột y khoa. Vui lòng xác nhận trước khi thêm.',
    };
  }

  // Thực hiện thêm/sửa vào chuỗi
  if (isNewDay) {
    const nextDayNum = plan.totalDays + 1;
    plan.totalDays = nextDayNum;
    plan.schedule.push({
      day: nextDayNum,
      morningSteps: [],
      eveningSteps: [
        {
          stepNumber: 1,
          stepName: productData.stepName || 'Đặc trị',
          category: productData.category || 'treatment',
          product: productData.productId || null,
          customProduct: {
            name: productData.name,
            brand: productData.brand || 'Chưa rõ',
            icon: productData.icon || 'bottle',
            ingredients: productData.ingredients || [],
          },
          reason: productData.reason || 'Sản phẩm bổ sung mới',
        },
      ],
    });
  } else if (targetDaySchedule) {
    const steps = session === 'morning' ? targetDaySchedule.morningSteps : targetDaySchedule.eveningSteps;
    const existingStep = steps.find((s) => s.stepNumber === Number(stepNumber));
    if (existingStep) {
      existingStep.stepName = productData.stepName || existingStep.stepName;
      existingStep.category = productData.category || existingStep.category;
      existingStep.product = productData.productId || null;
      existingStep.customProduct = {
        name: productData.name,
        brand: productData.brand || 'Chưa rõ',
        icon: productData.icon || 'bottle',
        ingredients: productData.ingredients || [],
      };
      existingStep.reason = productData.reason || existingStep.reason;
    } else {
      steps.push({
        stepNumber: Number(stepNumber) || steps.length + 1,
        stepName: productData.stepName || 'Đặc trị',
        category: productData.category || 'treatment',
        product: productData.productId || null,
        customProduct: {
          name: productData.name,
          brand: productData.brand || 'Chưa rõ',
          icon: productData.icon || 'bottle',
          ingredients: productData.ingredients || [],
        },
        reason: productData.reason || 'Sản phẩm mới thêm',
      });
    }
  }

  await plan.save();
  return {
    success: true,
    message: 'Đã lưu sản phẩm vào chuỗi routine thành công!',
    plan,
  };
};

/**
 * Tạo TreatmentPlan mẫu mặc định 14 ngày
 */
async function createDefaultTreatmentPlan(userId) {
  const closet = await Collection.find({ user: userId, status: 'active' });
  const schedule = [];

  for (let i = 1; i <= 14; i++) {
    const defaultSteps = buildDefault5Steps(closet, ['Bình thường'], 'Da_Hon_Hop');
    schedule.push({
      day: i,
      morningSteps: defaultSteps.morning,
      eveningSteps: defaultSteps.evening,
    });
  }

  const newPlan = await TreatmentPlan.create({
    user: userId,
    title: 'Chuỗi Routine Trị Mụn & Phục Hồi 14 Ngày',
    description: 'Phác đồ 14 ngày kết hợp làm dịu và kiểm soát dầu mụn theo lộ trình khoa học.',
    totalDays: 14,
    currentDay: 3, // Mock đang ở ngày 3
    status: 'active',
    schedule,
  });

  return newPlan;
}

/**
 * 41, 42, 43. Copy chuỗi routine từ bài đăng hoặc history
 */
const copyRoutineChain = async (userId, routineData) => {
  const closet = await Collection.find({ user: userId, status: 'active' });
  const activePlan = await TreatmentPlan.findOne({ user: userId, status: 'active' });

  const missingProducts = [];
  const adaptedSchedule = (routineData.schedule || []).map((dayItem) => {
    const newMorning = (dayItem.morningSteps || []).map((s) => adaptStepProduct(s, closet, missingProducts));
    const newEvening = (dayItem.eveningSteps || []).map((s) => adaptStepProduct(s, closet, missingProducts));
    return {
      day: dayItem.day,
      morningSteps: newMorning,
      eveningSteps: newEvening,
    };
  });

  // Tạo kế hoạch mới
  const newPlan = await TreatmentPlan.create({
    user: userId,
    title: `Bản sao: ${routineData.title || 'Chuỗi routine đã copy'}`,
    description: routineData.description || 'Được sao chép từ cộng đồng',
    totalDays: routineData.totalDays || 14,
    currentDay: 1,
    status: activePlan ? 'paused' : 'active',
    schedule: adaptedSchedule,
  });

  return {
    newPlan,
    hasActivePlan: !!activePlan,
    missingProductsNotice:
      missingProducts.length > 0
        ? `Tủ đồ của bạn thiếu ${missingProducts.length} sản phẩm trong chuỗi. Hệ thống đã tự động ghép sản phẩm tương đương trên kệ của bạn.`
        : null,
  };
};

function adaptStepProduct(step, closet, missingList) {
  const prodName = step.customProduct?.name || step.productName || 'Sản phẩm';
  // Tìm trong closet có sp tương đương theo category không
  const match = closet.find((c) => c.category === step.category);
  if (match) {
    return {
      ...step,
      product: match._id,
      customProduct: {
        name: match.productName,
        brand: match.brand,
        icon: match.icon,
      },
      reason: `Đã thay thế ${prodName} bằng ${match.productName} tương đương trong tủ đồ của bạn`,
    };
  } else {
    missingList.push(prodName);
    return step;
  }
}

module.exports = {
  getTodayDateStr,
  getHomeData,
  submitCheckin,
  undoCheckin,
  analyzeAndGenerateDailyRoutine,
  toggleStepCompletion,
  getTreatmentPlanDetail,
  suggestRoutinePlan,
  applySuggestedPlan,
  addOrEditProductInPlan,
  copyRoutineChain,
};