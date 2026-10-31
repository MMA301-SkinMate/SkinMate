const routineService = require('../services/routineService');
const { sendSuccess, sendError } = require('../utils/response');

class RoutineController {
    // UC 6 & UC 10: Lấy cẩm nang Do's & Don'ts
    async getGuide(req, res, next) {
        try {
            const user = req.user;
            const skinType = req.query.skinType || user?.skinProfile?.skinType || 'normal';
            const allergies = req.query.allergies ? req.query.allergies.split(',') : (user?.skinProfile?.allergies || []);
            const guide = await routineService.getSkinGuide(skinType, allergies);
            return sendSuccess(res, guide, 'Lấy cẩm nang da thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 8: Gợi ý chuỗi routine 7 ngày
    async suggestRoutine(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await routineService.generateRoutinePlan(userId);
            return sendSuccess(res, result, 'Gợi ý chuỗi routine thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 9 & UC 42: Chi tiết chuỗi routine
    async getRoutineDetail(req, res, next) {
        try {
            const { id } = req.params;
            const detail = await routineService.getRoutineDetail(id);
            return sendSuccess(res, detail, 'Lấy chi tiết chuỗi routine thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 9: Kích hoạt chuỗi routine
    async activateRoutine(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const plan = await routineService.activateRoutinePlan(userId, id);
            return sendSuccess(res, plan, 'Đã thêm vào chuỗi routine của tôi');
        } catch (err) {
            next(err);
        }
    }

    // UC 9: Bỏ qua chuỗi routine (Lưu nháp)
    async dismissRoutine(req, res, next) {
        try {
            const { id } = req.params;
            const result = await routineService.dismissRoutineSuggestion(id);
            return sendSuccess(res, result, 'Đã lưu nháp chuỗi routine');
        } catch (err) {
            next(err);
        }
    }

    // UC 40: Thiết lập lại hồ sơ da (với 3 xử lý tác động)
    async updateSkinProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { skinType, allergies, currentConcerns, forceReset } = req.body;
            const result = await routineService.updateSkinProfileWithImpact(userId, {
                skinType,
                allergies,
                currentConcerns,
            }, forceReset === true);

            return sendSuccess(res, result, 'Cập nhật hồ sơ da thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 41: Lịch sử chuỗi routine
    async getHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const history = await routineService.getRoutineHistory(userId);
            return sendSuccess(res, history, 'Lấy lịch sử chuỗi routine thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 43: Kiểm tra đối chiếu trước khi copy
    async checkCopyCompatibility(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const check = await routineService.checkCopyRoutineCompatibility(userId, id);
            return sendSuccess(res, check, 'Kiểm tra độ tương thích thành công');
        } catch (err) {
            next(err);
        }
    }

    // UC 43: Thực hiện copy chuỗi routine cũ
    async executeCopy(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { userChoice } = req.body; // 'start_now' hoặc 'queue_later'
            const result = await routineService.executeCopyRoutine(userId, id, { userChoice });
            return sendSuccess(res, result, result.message);
        } catch (err) {
            next(err);
        }
    }

    // UC 44: Lấy dữ liệu routine để chia sẻ
    async getSharePreview(req, res, next) {
        try {
            const { id } = req.params;
            const preview = await routineService.prepareRoutineForShare(id);
            return sendSuccess(res, preview, 'Lấy dữ liệu chia sẻ thành công');
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new RoutineController();
