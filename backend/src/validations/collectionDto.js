const Joi = require('joi');

const createCollectionSchema = Joi.object({
  productName: Joi.string().trim().required().messages({
    'string.empty': 'Tên sản phẩm không được để trống',
    'any.required': 'Tên sản phẩm là bắt buộc',
  }),
  brand: Joi.string().trim().allow('').default('Chưa rõ'),
  category: Joi.string()
    .valid('cleanser', 'toner', 'serum', 'treatment', 'moisturizer', 'sunscreen', 'other')
    .default('other'),
  icon: Joi.string().allow('').default('bottle'),
  ingredients: Joi.array().items(Joi.string()).default([]),
  activeIngredients: Joi.array().items(Joi.string()).default([]),
  openedDate: Joi.date().allow(null),
  expiryDate: Joi.date().allow(null),
  periodAfterOpeningMonths: Joi.number().integer().min(1).max(36).allow(null),
  notes: Joi.string().allow('').default(''),
});

const updateCollectionSchema = Joi.object({
  productName: Joi.string().trim(),
  brand: Joi.string().trim().allow(''),
  category: Joi.string().valid('cleanser', 'toner', 'serum', 'treatment', 'moisturizer', 'sunscreen', 'other'),
  icon: Joi.string().allow(''),
  ingredients: Joi.array().items(Joi.string()),
  activeIngredients: Joi.array().items(Joi.string()),
  openedDate: Joi.date().allow(null),
  expiryDate: Joi.date().allow(null),
  periodAfterOpeningMonths: Joi.number().integer().min(1).max(36).allow(null),
  status: Joi.string().valid('active', 'empty', 'expired', 'discarded'),
  isExpiredAcknowledged: Joi.boolean(),
  notes: Joi.string().allow(''),
});

module.exports = {
  createCollectionSchema,
  updateCollectionSchema,
};
