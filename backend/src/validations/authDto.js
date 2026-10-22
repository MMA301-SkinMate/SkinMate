const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Tên không được để trống',
    'string.min': 'Tên phải có ít nhất 2 ký tự',
    'any.required': 'Tên người dùng là bắt buộc',
  }),
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải từ 6 ký tự trở lên',
    'any.required': 'Mật khẩu là bắt buộc',
  }),
  skinType: Joi.string()
    .valid('Da_Dau', 'Da_Kho', 'Da_Hon_Hop', 'Da_Nhay_Cam', 'Da_Thuong')
    .default('Da_Hon_Hop'),
  allergies: Joi.array().items(Joi.string()).default([]),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Vui lòng nhập email',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu',
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  avatar: Joi.string().uri().allow(''),
  skinType: Joi.string().valid('Da_Dau', 'Da_Kho', 'Da_Hon_Hop', 'Da_Nhay_Cam', 'Da_Thuong'),
  allergies: Joi.array().items(Joi.string()),
  currentConditions: Joi.array().items(Joi.string()),
  notificationSettings: Joi.object({
    isEnabled: Joi.boolean(),
    morningTime: Joi.string(),
    eveningTime: Joi.string(),
    notifyExpiringProducts: Joi.boolean(),
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu hiện tại',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu mới phải từ 6 ký tự trở lên',
    'any.required': 'Vui lòng nhập mật khẩu mới',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};
