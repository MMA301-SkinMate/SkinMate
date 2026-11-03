const routineService = require('../services/routineService');

const getRoutine = async (req, res, next) => {
    try {
        const routine = await routineService.getRoutine(req.user.id, req.query.date);
        return res.json({ success: true, data: routine });
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

module.exports = { getRoutine, saveRoutine, checkIn, undoCheckIn };
