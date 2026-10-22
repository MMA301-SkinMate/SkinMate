const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(120).required().messages({
    'string.empty': 'Tiêu đề không được để trống',
    'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
    'any.required': 'Tiêu đề bài viết là bắt buộc',
  }),
  content: Joi.string().allow('').default(''),
  skinType: Joi.string().allow('').default('Da_Hon_Hop'),
  tags: Joi.array().items(Joi.string()).default([]),
  routineData: Joi.object({
    title: Joi.string().allow(''),
    totalDays: Joi.number().default(14),
    schedule: Joi.array().default([]),
  }).allow(null),
});

const reportPostSchema = Joi.object({
  reason: Joi.string().trim().required().messages({
    'string.empty': 'Vui lòng cung cấp lý do báo cáo',
    'any.required': 'Lý do báo cáo là bắt buộc',
  }),
});

module.exports = {
  createPostSchema,
  reportPostSchema,
};
