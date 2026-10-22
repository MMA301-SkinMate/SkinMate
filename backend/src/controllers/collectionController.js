const collectionService = require('../services/collectionService');
const {
  createCollectionSchema,
  updateCollectionSchema,
} = require('../validations/collectionDto');

const getCloset = async (req, res, next) => {
  try {
    const tab = req.query.tab || 'active';
    const products = await collectionService.getCloset(req.user._id, tab);
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductDetail = async (req, res, next) => {
  try {
    const product = await collectionService.getProductDetail(
      req.user._id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const { error, value } = createCollectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const newProduct = await collectionService.addProduct(
      req.user._id,
      value,
      req.user
    );
    return res.status(201).json({
      success: true,
      message: 'Đã thêm sản phẩm vào tủ đồ thành công',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { error, value } = updateCollectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const updated = await collectionService.updateProduct(
      req.user._id,
      req.params.id,
      value,
      req.user
    );
    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin sản phẩm thành công',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

const checkDeleteProduct = async (req, res, next) => {
  try {
    const result = await collectionService.checkDeleteProduct(
      req.user._id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const force = req.query.force === 'true' || req.body.force === true;
    const result = await collectionService.deleteProduct(
      req.user._id,
      req.params.id,
      force
    );
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const markAsEmpty = async (req, res, next) => {
  try {
    const result = await collectionService.markAsEmpty(
      req.user._id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu dùng hết sản phẩm',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getExpiringProducts = async (req, res, next) => {
  try {
    const result = await collectionService.getExpiringProducts(req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const acknowledgeExpiredProduct = async (req, res, next) => {
  try {
    const { action } = req.body; // 'discard' or 'keep'
    const result = await collectionService.acknowledgeExpiredProduct(
      req.user._id,
      req.params.id,
      action
    );
    return res.status(200).json({
      success: true,
      message:
        action === 'discard'
          ? 'Đã chuyển sản phẩm vào tab Đã sử dụng'
          : 'Đã lưu trạng thái tiếp tục sử dụng kèm cảnh báo',
      data: result,
    });
  } catch (error) {
    next(error);
  }
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
