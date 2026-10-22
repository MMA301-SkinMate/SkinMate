const TreatmentPlan = require('../models/TreatmentPlan');
const MyCollection = require('../models/MyCollection');
const User = require('../models/User');

/**
 * 1. Thuật toán gợi ý chuỗi Routine (ID 8, 9)
 * - Ráp từ sản phẩm active trong tủ đồ (loại bỏ sản phẩm expired)
 * - Nếu thiếu bước điều trị -> Gợi ý sản phẩm ngoài tủ
 * - Nếu da bình thường -> Tạo chu kỳ 7 ngày cấp ẩm căng bóng
 */
exports.generateRoutineChain = async (userId, targetConcern = 'Căng bóng cấp ẩm') => {
  // Lấy các sản phẩm còn hạn trong tủ đồ
  const products = await MyCollection.find({
    userId,
    status: { $in: ['active', 'expiring'] },
  });

  // Tìm sản phẩm theo loại trong tủ đồ
  const findProduct = (type) => products.find((p) => p.productType.toLowerCase() === type.toLowerCase());

  const cleanser = findProduct('cleanser');
  const toner = findProduct('toner');
  const serum = findProduct('serum');
  const cream = findProduct('cream');
  const sunscreen = findProduct('sunscreen');

  const daysPayload = [];
  const duration = 7;

  for (let i = 1; i <= duration; i++) {
    const isExfoliationDay = targetConcern.includes('mụn') && (i === 2 || i === 5);

    daysPayload.push({
      dayIndex: i,
      morning: [
        {
          stepNumber: 1,
          stepType: 'cleanser',
          productId: cleanser ? cleanser._id : null,
          productName: cleanser ? cleanser.productName : 'Sữa rửa mặt dịu nhẹ pH 5.5',
          isExternalSuggestion: !cleanser,
          usageNote: 'Làm sạch bã nhờn buổi sáng',
        },
        {
          stepNumber: 2,
          stepType: 'toner',
          productId: toner ? toner._id : null,
          productName: toner ? toner.productName : 'Toner cấp ẩm không cồn',
          isExternalSuggestion: !toner,
          usageNote: 'Cân bằng ẩm cho da',
        },
        {
          stepNumber: 5,
          stepType: 'sunscreen',
          productId: sunscreen ? sunscreen._id : null,
          productName: sunscreen ? sunscreen.productName : 'Kem chống nắng quang phổ rộng SPF 50+',
          isExternalSuggestion: !sunscreen,
          usageNote: 'Bảo vệ da bắt buộc buổi sáng',
        },
      ],
      evening: [
        {
          stepNumber: 1,
          stepType: 'cleanser',
          productId: cleanser ? cleanser._id : null,
          productName: cleanser ? cleanser.productName : 'Sữa rửa mặt làm sạch sâu',
          isExternalSuggestion: !cleanser,
        },
        {
          stepNumber: 2,
          stepType: 'toner',
          productId: toner ? toner._id : null,
          productName: toner ? toner.productName : 'Toner cân bằng',
          isExternalSuggestion: !toner,
        },
        {
          stepNumber: 3,
          stepType: 'treatment',
          productId: isExfoliationDay && serum ? serum._id : null,
          productName: isExfoliationDay
            ? (serum ? serum.productName : 'Serum BHA 2% / Tẩy tế bào chết')
            : 'Serum Phục hồi B5 / Hyaluronic Acid',
          isExternalSuggestion: isExfoliationDay && !serum,
          usageNote: isExfoliationDay ? 'Tẩy da chết làm sạch sâu (cách ngày)' : 'Cấp ẩm phục hồi màng bảo vệ',
        },
        {
          stepNumber: 4,
          stepType: 'moisturizer',
          productId: cream ? cream._id : null,
          productName: cream ? cream.productName : 'Kem dưỡng khóa ẩm ban đêm',
          isExternalSuggestion: !cream,
        },
      ],
    });
  }

  // Lưu bản nháp (Draft)
  const newPlan = await TreatmentPlan.create({
    userId,
    title: `Chuỗi Routine: ${targetConcern}`,
    targetConcern,
    durationDays: duration,
    planPayload: daysPayload,
    status: 'draft',
  });

  return newPlan;
};

/**
 * 2. Kích hoạt chuỗi Routine từ bản nháp
 */
exports.activatePlan = async (userId, planId) => {
  // Chuyển toàn bộ plan active cũ thành completed/archived
  await TreatmentPlan.updateMany({ userId, status: 'active' }, { status: 'completed' });

  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw new Error('Không tìm thấy chuỗi routine');

  plan.status = 'active';
  plan.startDate = new Date();
  await plan.save();

  return plan;
};

/**
 * 3. Tra cứu lịch sử chuỗi Routine (ID 41, 42)
 */
exports.getRoutineHistory = async (userId) => {
  return await TreatmentPlan.find({ userId }).sort({ createdAt: -1 });
};

/**
 * 4. Copy chuỗi Routine cũ (ID 43)
 * - Kiểm tra phác đồ đang chạy
 * - Đối chiếu tủ đồ hiện tại: Tự tìm sản phẩm có hoạt chất tương đương lấp chỗ trống nếu sản phẩm cũ đã hết
 */
exports.copyOldRoutine = async (userId, oldPlanId, overrideActive = false) => {
  const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
  if (activePlan && !overrideActive) {
    return {
      needConfirmOverride: true,
      message: 'Bạn đang có một phác đồ đang chạy. Bạn có muốn dừng phác đồ cũ để bắt đầu phác đồ này không?',
    };
  }

  const oldPlan = await TreatmentPlan.findOne({ _id: oldPlanId, userId });
  if (!oldPlan) throw new Error('Không tìm thấy chuỗi routine cũ');

  const currentProducts = await MyCollection.find({
    userId,
    status: { $in: ['active', 'expiring'] },
  });

  const replacedItems = [];

  // Duyệt và tự động thay thế nếu sản phẩm không còn trong tủ
  const newPayload = oldPlan.planPayload.map((day) => {
    const mapStep = (step) => {
      const exists = currentProducts.find((p) => p._id.toString() === step.productId?.toString());
      if (exists) {
        return step;
      }

      // Tìm sản phẩm cùng loại còn trong tủ để thay thế
      const fallback = currentProducts.find((p) => p.productType.toLowerCase() === step.stepType.toLowerCase());
      if (fallback) {
        replacedItems.push({
          oldProduct: step.productName,
          replacedWith: fallback.productName,
        });
        return {
          ...step.toObject(),
          productId: fallback._id,
          productName: fallback.productName,
          isExternalSuggestion: false,
        };
      }

      return {
        ...step.toObject(),
        productId: null,
        isExternalSuggestion: true,
      };
    };

    return {
      dayIndex: day.dayIndex,
      morning: day.morning.map(mapStep),
      evening: day.evening.map(mapStep),
    };
  });

  if (overrideActive && activePlan) {
    activePlan.status = 'completed';
    await activePlan.save();
  }

  const copiedPlan = await TreatmentPlan.create({
    userId,
    title: `[Sao chép] ${oldPlan.title}`,
    targetConcern: oldPlan.targetConcern,
    durationDays: oldPlan.durationDays,
    planPayload: newPayload,
    status: 'active',
    startDate: new Date(),
  });

  return {
    copiedPlan,
    replacedItems,
  };
};

/**
 * 5. Xuất payload để chia sẻ chuỗi Routine lên bài đăng Community (ID 44)
 */
exports.prepareRoutineForShare = async (userId, planId) => {
  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw new Error('Không tìm thấy chuỗi routine để chia sẻ');

  return {
    routineTitle: plan.title,
    targetConcern: plan.targetConcern,
    durationDays: plan.durationDays,
    snapshotPayload: plan.planPayload,
  };
};