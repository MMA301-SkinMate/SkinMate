const Joi = require('joi');
const AppError = require('../errors/app-error');

const password = Joi.string().min(8).max(128).custom((value, helpers) => {
  if (Buffer.byteLength(value, 'utf8') > 72) {
    return helpers.error('any.invalid');
  }
  return value;
}).required();

const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password,
  fullName: Joi.string().trim().min(2).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().trim().min(32).max(512).required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().trim().min(32).max(512).optional(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().trim().min(32).max(512).required(),
  password,
});

const googleExchangeSchema = Joi.object({
  code: Joi.string().trim().min(32).max(512).required(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.required().validate(req.body || {}, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return next(new AppError('Request body is invalid', 400, 'VALIDATION_ERROR'));
    }
    req.body = value;
    return next();
  };
}

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateRefresh: validate(refreshSchema),
  validateLogout: validate(logoutSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateGoogleExchange: validate(googleExchangeSchema),
};
