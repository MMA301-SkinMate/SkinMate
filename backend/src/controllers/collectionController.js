const Collection = require('../models/Collection');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const DEFAULT_USER_ID = '6ad620492ae8913ed1eb2871';

const fields = [
  'productName',
  'productType',
  'productIcon',
  'productImageUrl',
  'ingredients',
  'analysisResult',
  'openedDate',
  'expirationDate',
  'paoDays',
  'note',
  'status',
  'continueAfterExpiry',
  'routineUsage',
  'brand',
  'size',
  'remainingPercent',
];
const serialize = product => {
  const value = product.toObject ? product.toObject() : product;
  const result = { id: value._id.toString() };
  fields.forEach(field => {
    if (value[field] !== undefined) {
      result[field] = value[field];
    }
  });
  result.createdAt = value.createdAt;
  result.updatedAt = value.updatedAt;
  return result;
};
const notFound = res => res.status(404).json({ error: { message: 'Collection product was not found', code: 'COLLECTION_NOT_FOUND' } });

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: 'A JPG, PNG, or WebP image is required', code: 'INVALID_IMAGE' } });
    const result = await uploadToCloudinary(req.file, 'skinmate/collection');
    res.status(201).json({ imageUrl: result.secureUrl });
  } catch (error) {
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId || DEFAULT_USER_ID;
    const filter = userId ? { userId } : {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const products = await Collection.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ products: products.map(serialize) });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.userId || DEFAULT_USER_ID;
    const product = await Collection.create({
      status: req.body.status || 'active',
      ...req.body,
      userId,
    });
    res.status(201).json({ product: serialize(product) });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    const product = await Collection.findById(req.params.id).lean();
    return product ? res.json({ product: serialize(product) }) : notFound(res);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Collection.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    return product ? res.json({ product: serialize(product) }) : notFound(res);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    return await Collection.findByIdAndDelete(req.params.id) ? res.status(204).send() : notFound(res);
  } catch (error) {
    next(error);
  }
};
