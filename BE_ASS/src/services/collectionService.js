const MyCollection = require('../models/MyCollection');

const productTypes = ['cleanser', 'toner', 'serum', 'cream', 'moisturizer', 'sunscreen', 'treatment'];
const productStatuses = ['active', 'expiring', 'expired', 'finished', 'archived'];

const validateProduct = (values) => {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    const error = new Error('Dữ liệu sản phẩm không hợp lệ');
    error.status = 400;
    throw error;
  }
  if (values.productName !== undefined && (typeof values.productName !== 'string' || !values.productName.trim())) {
    const error = new Error('Tên sản phẩm không hợp lệ');
    error.status = 400;
    throw error;
  }
  if (values.productType !== undefined && !productTypes.includes(values.productType)) {
    const error = new Error('Loại sản phẩm không hợp lệ');
    error.status = 400;
    throw error;
  }
  if (values.status !== undefined && !productStatuses.includes(values.status)) {
    const error = new Error('Trạng thái sản phẩm không hợp lệ');
    error.status = 400;
    throw error;
  }
  if (values.ingredientsList !== undefined
    && (!Array.isArray(values.ingredientsList) || values.ingredientsList.some((item) => typeof item !== 'string'))) {
    const error = new Error('Danh sách thành phần không hợp lệ');
    error.status = 400;
    throw error;
  }
  for (const dateField of ['openedDate', 'expirationDate']) {
    if (values[dateField] !== undefined && values[dateField] !== null
      && (typeof values[dateField] !== 'string' || Number.isNaN(Date.parse(values[dateField])))) {
      const error = new Error(`Ngày ${dateField} không hợp lệ`);
      error.status = 400;
      throw error;
    }
  }
};

exports.listProducts = (userId) => MyCollection.find({ userId }).sort({ createdAt: -1 });

exports.addProduct = async (userId, values) => {
  validateProduct(values);
  if (typeof values.productName !== 'string' || !values.productName.trim() || !values.productType) {
    const error = new Error('Tên và loại sản phẩm là bắt buộc');
    error.status = 400;
    throw error;
  }

  return MyCollection.create({
    userId,
    productName: values.productName.trim(),
    productType: values.productType,
    ingredientsList: values.ingredientsList || [],
    openedDate: values.openedDate || null,
    expirationDate: values.expirationDate || null,
    status: values.status || 'active',
    note: values.note || null,
  });
};

exports.updateProduct = async (userId, productId, values) => {
  validateProduct(values);
  const allowedFields = ['productName', 'productType', 'ingredientsList', 'openedDate', 'expirationDate', 'status', 'note'];
  const updates = Object.fromEntries(Object.entries(values).filter(([key]) => allowedFields.includes(key)));
  const product = await MyCollection.findOneAndUpdate(
    { _id: productId, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!product) {
    const error = new Error('Không tìm thấy sản phẩm');
    error.status = 404;
    throw error;
  }
  return product;
};

exports.deleteProduct = async (userId, productId) => {
  const product = await MyCollection.findOneAndDelete({ _id: productId, userId });
  if (!product) {
    const error = new Error('Không tìm thấy sản phẩm');
    error.status = 404;
    throw error;
  }
  return product;
};
