const TreatmentPlan = require('../models/TreatmentPlan');
const MyCollection = require('../models/MyCollection');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

const notFound = (message) => {
  const error = new Error(message);
  error.status = 404;
  return error;
};

/**
 * 1. Thuật toán gợi ý chuỗi Routine (ID 8, 9)
 * - Ráp từ sản phẩm active trong tủ đồ (loại bỏ sản phẩm expired)
 * - Nếu thiếu bước điều trị -> Gợi ý sản phẩm ngoài tủ
 * - Nếu da bình thường -> Tạo chu kỳ 7 ngày cấp ẩm căng bóng
 */
exports.generateRoutineChain = async (userId, targetConcern = 'Căng bóng cấp ẩm') => {
  const user = await User.findById(userId);
  if (!user) throw new Error('Không tìm thấy người dùng');

  const concern = targetConcern || user.skinProfile?.currentConcerns?.[0] || 'Căng bóng cấp ẩm';
  // Lấy các sản phẩm còn hạn trong tủ đồ
  const products = await MyCollection.find({
    userId,
    status: { $in: ['active', 'expiring'] },
    $or: [{ expirationDate: null }, { expirationDate: { $gt: new Date() } }],
  });

  // Tìm sản phẩm theo loại trong tủ đồ
  const compatibleTypes = {
    cleanser: ['cleanser'],
    toner: ['toner'],
    serum: ['serum', 'treatment'],
    cream: ['cream', 'moisturizer'],
    sunscreen: ['sunscreen'],
  };
  const findProduct = (type) => products.find((product) => compatibleTypes[type].includes(product.productType.toLowerCase()));

  const cleanser = findProduct('cleanser');
  const toner = findProduct('toner');
  const serums = products.filter((product) => ['serum', 'treatment'].includes(product.productType.toLowerCase()));
  const serum = serums.find((product) => (
    !product.ingredientsList.some((ingredient) => /salicylic acid|bha|aha|glycolic acid|lactic acid/i.test(ingredient))
  ));
  const exfoliatingSerum = serums.find((product) => (
    product.ingredientsList.some((ingredient) => /salicylic acid|bha|aha|glycolic acid|lactic acid/i.test(ingredient))
  ));
  const cream = findProduct('cream');
  const sunscreen = findProduct('sunscreen');

  const daysPayload = [];
  const duration = 7;

  for (let i = 1; i <= duration; i++) {
    const isExfoliationDay = concern.toLowerCase().includes('mụn') && (i === 2 || i === 5);
    const treatmentProduct = isExfoliationDay ? exfoliatingSerum : serum;
    const treatmentIngredient = isExfoliationDay ? 'Salicylic Acid' : undefined;

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
          productId: treatmentProduct ? treatmentProduct._id : null,
          productName: treatmentProduct
            ? treatmentProduct.productName
            : (isExfoliationDay ? 'Serum BHA 2% / Tẩy tế bào chết' : 'Serum phục hồi B5 / Hyaluronic Acid'),
          targetActiveIngredient: treatmentIngredient,
          isExternalSuggestion: !treatmentProduct,
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
    title: `Chuỗi Routine: ${concern}`,
    targetConcern: concern,
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
  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw notFound('Không tìm thấy chuỗi routine');
  if (plan.status === 'active') return plan;
  if (plan.status !== 'draft') {
    const error = new Error('Chỉ có thể kích hoạt routine ở trạng thái gợi ý');
    error.status = 400;
    throw error;
  }

  await TreatmentPlan.updateMany({ userId, status: 'active' }, { status: 'completed' });
  plan.status = 'active';
  plan.isSkipped = false;
  plan.startDate = new Date();
  await plan.save();

  return plan;
};

/**
 * 3. Tra cứu lịch sử chuỗi Routine (ID 41, 42)
 */
exports.getRoutineHistory = async (userId) => {
  const activePlans = await TreatmentPlan.find({ userId, status: 'active', startDate: { $ne: null } });
  const now = new Date();
  for (const plan of activePlans) {
    const elapsedDays = Math.floor((now.getTime() - plan.startDate.getTime()) / (24 * 60 * 60 * 1000));
    if (elapsedDays >= plan.durationDays) {
      plan.status = 'completed';
      plan.completedDate = new Date(
        plan.startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000
      );
      await plan.save();
    }
  }

  return await TreatmentPlan.find({
    userId,
    isSkipped: { $ne: true },
    status: { $in: ['active', 'paused', 'completed', 'canceled'] },
  }).sort({ createdAt: -1 });
};

exports.skipPlan = async (userId, planId) => {
  const plan = await TreatmentPlan.findOneAndUpdate(
    { _id: planId, userId, status: 'draft' },
    { $set: { isSkipped: true, status: 'canceled' } },
    { new: true }
  );
  if (!plan) throw notFound('Không tìm thấy gợi ý routine có thể bỏ qua');
  return plan;
};

/**
 * 4. Copy chuỗi Routine cũ (ID 43)
 * - Kiểm tra phác đồ đang chạy
 * - Đối chiếu tủ đồ hiện tại: Tự tìm sản phẩm có hoạt chất tương đương lấp chỗ trống nếu sản phẩm cũ đã hết
 */
exports.copyOldRoutine = async (userId, oldPlanId, overrideActive = false) => {
  const oldPlan = await TreatmentPlan.findOne({ _id: oldPlanId, userId });
  if (!oldPlan) throw notFound('Không tìm thấy chuỗi routine cũ');

  const activePlan = await TreatmentPlan.findOne({ userId, status: 'active' });
  if (activePlan && !overrideActive) {
    return {
      needConfirmOverride: true,
      message: 'Bạn đang có một phác đồ đang chạy. Bạn có muốn dừng phác đồ cũ để bắt đầu phác đồ này không?',
    };
  }

  const currentProducts = await MyCollection.find({
    userId,
    status: { $in: ['active', 'expiring'] },
    $or: [{ expirationDate: null }, { expirationDate: { $gt: new Date() } }],
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
      const stepTypeAliases = {
        moisturizer: ['cream', 'moisturizer'],
        treatment: ['serum', 'treatment'],
      };
      const supportedTypes = stepTypeAliases[step.stepType] || [step.stepType];
      const compatibleProducts = currentProducts.filter((p) => supportedTypes.includes(p.productType.toLowerCase()));
      const fallback = step.targetActiveIngredient
        ? compatibleProducts.find((product) => product.ingredientsList.some(
          (ingredient) => ingredient.toLowerCase().includes(step.targetActiveIngredient.toLowerCase())
        ))
        : compatibleProducts[0];
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
        productName: step.productName,
        isExternalSuggestion: true,
      };
    };

    return {
      dayIndex: day.dayIndex,
      morning: day.morning.map(mapStep),
      evening: day.evening.map(mapStep),
    };
  });

  const copiedPlan = await TreatmentPlan.create({
    userId,
    title: `[Sao chép] ${oldPlan.title}`,
    targetConcern: oldPlan.targetConcern,
    durationDays: oldPlan.durationDays,
    planPayload: newPayload,
    status: 'active',
    startDate: new Date(),
  });

  if (overrideActive && activePlan) {
    await TreatmentPlan.updateOne(
      { _id: activePlan._id, userId, status: 'active' },
      { $set: { status: 'completed' } }
    );
  }

  return {
    copiedPlan,
    replacedItems,
  };
};

/**
 * 5. Xuất payload để chia sẻ chuỗi Routine lên bài đăng Community (ID 44)
 */
exports.prepareRoutineForShare = async (userId, planId, { title, note, planPayload } = {}) => {
  const plan = await TreatmentPlan.findOne({ _id: planId, userId });
  if (!plan) throw notFound('Không tìm thấy chuỗi routine để chia sẻ');

  if (typeof title !== 'string' || !title.trim()) {
    const error = new Error('Vui lòng nhập tiêu đề bài chia sẻ');
    error.status = 400;
    throw error;
  }
  if (planPayload !== undefined && (!Array.isArray(planPayload) || planPayload.length !== plan.durationDays)) {
    const error = new Error('Nội dung routine chia sẻ không hợp lệ');
    error.status = 400;
    throw error;
  }

  return CommunityPost.create({
    userId,
    planId: plan._id,
    title: title.trim(),
    note: typeof note === 'string' ? note.trim() : '',
    planPayload: planPayload || plan.planPayload,
  });
};