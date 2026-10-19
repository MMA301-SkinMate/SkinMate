const Collection = require('../models/Collection');
const TreatmentPlan = require('../models/TreatmentPlan');
const { calculateSuitabilityScore } = require('../utils/scoreCalculator');

const getCloset = async (userId, tab = 'active') => {
  let query = { user: userId };
  if (tab === 'active') {
    query.status = 'active';
  } else {
    query.status = { $in: ['empty', 'expired', 'discarded'] };
  }

  const products = await Collection.find(query).sort({ updatedAt: -1 });

  // Categorize or flag expiring products
  const now = new Date();
  const enhancedProducts = products.map((prod) => {
    const prodObj = prod.toObject({ virtuals: true });
    if (prod.expiryDate) {
      const diffTime = prod.expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      prodObj.daysUntilExpiry = diffDays;
      prodObj.needsAttention = diffDays <= 7;
    }
    return prodObj;
  });

  return enhancedProducts;
};

const getProductDetail = async (userId, productId) => {
  const product = await Collection.findOne({ _id: productId, user: userId });
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm trong tủ đồ');
  }
  return product.toObject({ virtuals: true });
};

const addProduct = async (userId, productData, userSkinProfile) => {
  const skinType = userSkinProfile?.skinType || 'Da_Hon_Hop';
  const currentConditions = userSkinProfile?.currentConditions || ['Bình thường'];

  // Calculate score
  const { finalScore } = calculateSuitabilityScore({
    ingredients: productData.ingredients || [],
    skinType,
    currentConditions,
  });

  const newProduct = await Collection.create({
    ...productData,
    user: userId,
    suitabilityScore: finalScore,
    status: 'active',
  });

  return newProduct;
};

const updateProduct = async (userId, productId, updateData, userSkinProfile) => {
  const product = await Collection.findOne({ _id: productId, user: userId });
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  // If ingredients changed, recalculate score
  if (updateData.ingredients) {
    const skinType = userSkinProfile?.skinType || 'Da_Hon_Hop';
    const currentConditions = userSkinProfile?.currentConditions || ['Bình thường'];
    const { finalScore } = calculateSuitabilityScore({
      ingredients: updateData.ingredients,
      skinType,
      currentConditions,
    });
    updateData.suitabilityScore = finalScore;
  }

  Object.assign(product, updateData);
  await product.save();

  return product;
};

const checkDeleteProduct = async (userId, productId) => {
  const product = await Collection.findOne({ _id: productId, user: userId });
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  // Check if product is in an active TreatmentPlan
  const activePlan = await TreatmentPlan.findOne({
    user: userId,
    status: 'active',
  });

  let isInActivePlan = false;
  let replacementProduct = null;

  if (activePlan) {
    for (const day of activePlan.schedule) {
      const foundInMorning = day.morningSteps.some(
        (s) => s.product && s.product.toString() === productId.toString()
      );
      const foundInEvening = day.eveningSteps.some(
        (s) => s.product && s.product.toString() === productId.toString()
      );
      if (foundInMorning || foundInEvening) {
        isInActivePlan = true;
        break;
      }
    }

    if (isInActivePlan) {
      // Find candidate replacement in user's active closet
      replacementProduct = await Collection.findOne({
        user: userId,
        status: 'active',
        _id: { $ne: productId },
        category: product.category,
      });
    }
  }

  return {
    isInActivePlan,
    warning: isInActivePlan
      ? 'Sản phẩm này đang được dùng trong Phác đồ điều trị của bạn. Hệ thống sẽ tự động thay thế bằng sản phẩm tương đương trong tủ đồ. Bạn có chắc chắn muốn xóa?'
      : null,
    replacementProduct,
  };
};

const deleteProduct = async (userId, productId, force = false) => {
  const check = await checkDeleteProduct(userId, productId);

  if (check.isInActivePlan && !force) {
    return {
      requiresConfirmation: true,
      message: check.warning,
      replacementProduct: check.replacementProduct,
    };
  }

  // If in active plan, replace product in schedule
  if (check.isInActivePlan) {
    const activePlan = await TreatmentPlan.findOne({
      user: userId,
      status: 'active',
    });
    if (activePlan) {
      const repId = check.replacementProduct ? check.replacementProduct._id : null;
      for (const day of activePlan.schedule) {
        day.morningSteps.forEach((s) => {
          if (s.product && s.product.toString() === productId.toString()) {
            s.product = repId;
            if (check.replacementProduct) {
              s.reason = `Đã tự động thay thế bằng ${check.replacementProduct.productName}`;
            }
          }
        });
        day.eveningSteps.forEach((s) => {
          if (s.product && s.product.toString() === productId.toString()) {
            s.product = repId;
            if (check.replacementProduct) {
              s.reason = `Đã tự động thay thế bằng ${check.replacementProduct.productName}`;
            }
          }
        });
      }
      await activePlan.save();
    }
  }

  await Collection.deleteOne({ _id: productId, user: userId });
  return { success: true, message: 'Đã xóa sản phẩm khỏi tủ đồ thành công' };
};

const markAsEmpty = async (userId, productId) => {
  const product = await Collection.findOne({ _id: productId, user: userId });
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  product.status = 'empty';
  await product.save();

  return product;
};

const getExpiringProducts = async (userId) => {
  const products = await Collection.find({ user: userId, status: 'active' });
  const now = new Date();

  const expiringSoon = []; // Sắp hết hạn trong 7 ngày
  const expired = []; // Đã hết hạn

  for (const prod of products) {
    if (!prod.expiryDate) continue;
    const diffTime = prod.expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      expired.push(prod);
    } else if (diffDays <= 7) {
      expiringSoon.push({ product: prod, daysRemaining: diffDays });
    }
  }

  return {
    expiringSoon,
    expired,
    hasExpiredAlert: expired.length > 0 && !expired.every((p) => p.isExpiredAcknowledged),
  };
};

const acknowledgeExpiredProduct = async (userId, productId, action) => {
  const product = await Collection.findOne({ _id: productId, user: userId });
  if (!product) {
    throw new Error('Không tìm thấy sản phẩm');
  }

  if (action === 'discard' || action === 'archive') {
    product.status = 'expired';
  } else if (action === 'keep') {
    product.isExpiredAcknowledged = true;
  }
  await product.save();

  return product;
};

module.exports = {
  getCloset,
  getProductDetail,
  addProduct,
  updateProduct,
  checkDeleteProduct,
  deleteProduct,
  markAsEmpty,
  getExpiringProducts,
  acknowledgeExpiredProduct,
};
