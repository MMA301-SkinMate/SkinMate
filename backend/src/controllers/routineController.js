const routineService = require('../services/routineService');

const getRoutine = async (req, res, next) => {
    try {
        const routine = await routineService.getRoutine(req.user.id, req.query.date);
        return res.json({ success: true, data: routine });
    } catch (error) {
        return next(error);
    }
};

const getActivePlan = async (req, res, next) => {
    try {
        const plan = await routineService.getActivePlan(req.user.id);
        return res.json({ success: true, data: plan });
    } catch (error) {
        return next(error);
    }
};

const getRoutineHistory = async (req, res, next) => {
    try {
        const history = await routineService.getRoutineHistory(req.user.id);
        return res.json({ success: true, data: history });
    } catch (error) {
        return next(error);
    }
};

const saveRoutine = async (req, res, next) => {
    try {
        const routine = await routineService.upsertRoutine(req.user.id, req.body);
        return res.status(200).json({ success: true, data: routine });
    } catch (error) {
        return next(error);
    }
};

const checkIn = async (req, res, next) => {
    try {
        const result = await routineService.checkIn(req.user.id, req.body);
        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        return next(error);
    }
};

const undoCheckIn = async (req, res, next) => {
    try {
        const routine = await routineService.undoCheckIn(req.user.id, req.body);
        return res.status(200).json({ success: true, data: routine });
    } catch (error) {
        return next(error);
    }
};

const recommend = async (req, res, next) => {
    try {
        const recommendation = await routineService.recommendRoutine(req.user.id, req.body);
        return res.json({ success: true, data: recommendation });
    } catch (error) {
        return next(error);
    }
};

const createPlan = async (req, res, next) => {
    try {
        const plan = await routineService.createRoutinePlan(req.user.id, req.body);
        return res.status(201).json({ success: true, data: plan });
    } catch (error) {
        return next(error);
    }
};

const validate = async (req, res, next) => {
    try {
        const result = await routineService.validateRoutineProducts(req.user.id, req.body);
        return res.json({ success: true, data: result });
    } catch (error) {
        return next(error);
    }
};

module.exports = { getRoutine, getActivePlan, getRoutineHistory, saveRoutine, checkIn, undoCheckIn, recommend, createPlan, validate };
