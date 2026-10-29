const collectionService = require('../services/collectionService');

exports.listProducts = async (req, res, next) => {
  try {
    const products = await collectionService.listProducts(req.user.id);
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

exports.addProduct = async (req, res, next) => {
  try {
    const product = await collectionService.addProduct(req.user.id, req.body || {});
    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await collectionService.updateProduct(req.user.id, req.params.productId, req.body || {});
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await collectionService.deleteProduct(req.user.id, req.params.productId);
    return res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi tủ đồ' });
  } catch (error) {
    next(error);
  }
};
