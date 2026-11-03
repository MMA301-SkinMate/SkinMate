const Joi = require('joi');
const { productTypes, productIcons } = require('../models/Collection');
const { skinTypes, skinConditions } = require('../models/Community');

const routineStep = Joi.object({
  productName: Joi.string().trim().min(1).max(150).required(),
  productType: Joi.string().valid(...productTypes).required(),
  productIcon: Joi.string().valid(...productIcons).allow(null, ''),
  ingredients: Joi.array().items(Joi.string().trim().max(200)).max(100),
  brand: Joi.string().trim().max(100).allow(null, ''),
  note: Joi.string().trim().max(300).allow(null, ''),
});

const createSchema = Joi.object({
  title: Joi.string().trim().max(150).allow(''),
  note: Joi.string().trim().max(2000).allow(''),
  content: Joi.string().trim().max(2000).allow(''),
  images: Joi.array().items(Joi.string().uri({ scheme: ['https'] }).pattern(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//)).max(5),
  tags: Joi.array().items(Joi.string().trim().pattern(/^#[\p{L}\p{N}_]{1,30}$/u)).max(10),
  skinType: Joi.string().valid(...skinTypes).allow(null),
  skinTypes: Joi.array().items(Joi.string().valid(...skinTypes)).unique().max(skinTypes.length),
  skinConditions: Joi.array().items(Joi.string().valid(...skinConditions)).unique().max(skinConditions.length),
  sharedRoutine: Joi.object({
    morning: Joi.array().items(routineStep).max(15),
    evening: Joi.array().items(routineStep).max(15),
    days: Joi.array().items(Joi.object({
      morning: Joi.array().items(routineStep).max(15),
      evening: Joi.array().items(routineStep).max(15),
    })).min(1).max(31),
  }).allow(null),
  status: Joi.string().valid('draft', 'published').default('published'),
}).custom((value, helpers) => {
  if (value.status === 'published' && !value.content?.trim()) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Published post content requirement').messages({
  'any.invalid': 'Content is required when publishing a post',
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: { message: error.details?.[0]?.message || 'Request body is invalid', code: 'VALIDATION_ERROR' } });
    req.body = value;
    next();
  };
}

exports.create = validate(createSchema);
exports.id = (req, res, next) => /^[a-f\d]{24}$/i.test(req.params.id) ? next() : res.status(404).json({ error: { message: 'Community post was not found', code: 'POST_NOT_FOUND' } });
exports.listQuery = (req, res, next) => {
  const schema = Joi.object({
    skinType: Joi.string().valid(...skinTypes),
    skinCondition: Joi.string().valid(...skinConditions),
    tag: Joi.string().trim(),
    mine: Joi.string().valid('true', 'false'),
    status: Joi.string().valid('draft', 'published', 'hidden', 'deleted'),
  });
  const { error, value } = schema.validate(req.query || {}, { stripUnknown: true });
  if (error) return res.status(400).json({ error: { message: 'Query string is invalid', code: 'VALIDATION_ERROR' } });
  req.query = value;
  next();
};
