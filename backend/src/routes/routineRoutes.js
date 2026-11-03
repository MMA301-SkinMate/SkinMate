const express = require('express');
const Joi = require('joi');
const authenticate = require('../middlewares/authMiddleware');
const controller = require('../controllers/routineController');
const { SKIN_CONDITIONS } = require('../services/routineService');

const router = express.Router();
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({ success: false, message: 'Dữ liệu routine không hợp lệ.', error: { code: 'VALIDATION_ERROR', details: error.details } });
    }
    req.body = value;
    return next();
};
const productIds = Joi.array().items(Joi.string().hex().length(24)).default([]);
const optionalProductIds = Joi.array().items(Joi.string().hex().length(24));
const routineFields = {
    date: Joi.date().iso().required(),
    skinCondition: Joi.string().valid(...SKIN_CONDITIONS),
    skinConditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    morningProducts: productIds,
    eveningProducts: productIds,
    routineGroupId: Joi.string().trim().max(100).allow(null, ''),
    dayNumber: Joi.number().integer().min(1),
    totalDays: Joi.number().integer().min(1),
};

router.use(authenticate);
router.get('/plans/active', controller.getActivePlan);
router.get('/plans/history', controller.getRoutineHistory);
router.get('/', controller.getRoutine);
router.post('/recommend', validate(Joi.object({
    conditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    skinConditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
}).or('conditions', 'skinConditions').default({})), controller.recommend);
router.post('/plans', validate(Joi.object({
    title: Joi.string().trim().max(150),
    startDate: Joi.date().iso(),
    totalDays: Joi.number().integer().min(1).max(365).default(14),
    conditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    skinConditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    morningProducts: productIds,
    eveningProducts: productIds,
}).or('conditions', 'skinConditions').default({})), controller.createPlan);
router.post('/validate', validate(Joi.object({
    conditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    skinConditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1),
    morningProducts: productIds,
    eveningProducts: productIds,
}).or('conditions', 'skinConditions').default({})), controller.validate);
router.put('/', validate(Joi.object(routineFields).or('skinCondition', 'skinConditions')), controller.saveRoutine);
router.put('/check-in', validate(Joi.object({
    date: Joi.date().iso().required(),
    conditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1).required(),
    morningProducts: optionalProductIds,
    eveningProducts: optionalProductIds,
}),), (req, _res, next) => {
    req.body.skinConditions = req.body.conditions;
    return next();
}, controller.checkIn);
router.post('/check-in/undo', validate(Joi.object({
    date: Joi.date().iso().required(),
    previousConditions: Joi.array().items(Joi.string().valid(...SKIN_CONDITIONS)).min(1).required(),
}),), controller.undoCheckIn);

module.exports = router;
