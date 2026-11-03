/**
 * collectionController.js
 *
 * Handlers are split into two groups:
 *  A) Scan-flow handlers (analyzeProduct, saveDraft, addProduct) — preserved exactly.
 *  B) Collection CRUD handlers — delegated cleanly to collectionService.
 */

const mongoose = require('mongoose');
const Collection  = require('../models/Collection');
const User        = require('../models/User');
const DailyRoutine = require('../models/DailyRoutine');
const collectionService = require('../services/collectionService');
const { calculateProductScores } = require('../services/analysisService');
const { analyzeProductByScores } = require('../services/geminiService');

// ============================================================
// A) SCAN-FLOW HANDLERS (do NOT modify — preserved from scan)
// ============================================================

const analyzeProduct = async (req, res) => {
    try {
        const { productName, productType, ingredientList, userId: bodyUserId } = req.body;
        const ingredients = Array.isArray(ingredientList) && ingredientList.length > 0
            ? ingredientList
            : (Array.isArray(req.body.ingredients) ? req.body.ingredients : []);

        const userId = req.user?.id || bodyUserId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Please login to analyze products',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const skinType = user?.skinProfile?.skinType || 'Da_Thuong';
        const todayStr = new Date().toISOString().split('T')[0];

        let routineIngredients = [];
        let todayCondition = 'Binh_Thuong';

        if (user?._id) {
            const todayRoutine = await DailyRoutine.findOne({ userId: user._id, date: todayStr })
                .populate('morningProducts eveningProducts', 'ingredients');

            if (todayRoutine) {
                todayCondition = todayRoutine.skinCondition || 'Binh_Thuong';
                const morningIngs = todayRoutine.morningProducts ? todayRoutine.morningProducts.flatMap(p => p.ingredients || []) : [];
                const eveningIngs = todayRoutine.eveningProducts ? todayRoutine.eveningProducts.flatMap(p => p.ingredients || []) : [];
                routineIngredients = [...morningIngs, ...eveningIngs];
            }
        }

        const userClosetProducts = await Collection.find({ userId: user._id, status: { $in: ['active', 'expired_warning'] } })
            .select('productName productType ingredients');

        const scores = calculateProductScores({
            ingredients,
            skinType,
            todayCondition,
            routineIngredients,
        });

        let aiResponse = null;
        try {
            aiResponse = await analyzeProductByScores({
                productName,
                productType,
                baseScore:       scores.baseScore,
                contextualScore: scores.contextualScore,
                skinType,
                todayCondition,
                ingredients,
                userClosetProducts,
            });
        } catch (aiError) {
            console.warn('[collectionController] AI analysis error, using fallback:', aiError.message);
        }

        const analysisResult = {
            baseScore:       scores.baseScore,
            contextualScore: scores.contextualScore,
            verdict: aiResponse?.verdict || {
                text:       `Sản phẩm có độ phù hợp ${scores.contextualScore}% với tình trạng da hiện tại.`,
                badgeLevel: scores.contextualScore >= 80 ? 'success' : scores.contextualScore >= 50 ? 'warning' : 'danger',
            },
            conflictResolution: aiResponse?.conflictResolution || {
                hasConflict: false,
                details:     'Chưa phát hiện xung đột hoạt chất nghiêm trọng với chu trình hiện tại.',
            },
            pairingRecommendation: aiResponse?.pairingRecommendation || {
                matchedProductInCloset: null,
                advice:              'Nên chọn thêm các sản phẩm phục hồi dịu nhẹ.',
                ingredientsToAdd:    ['Panthenol (B5)', 'Ceramide'],
                ingredientsToAvoid:  [],
            },
            futurePlan: aiResponse?.futurePlan || {
                frequency: '2 - 3 lần / tuần',
                timing:    'Buổi tối',
                notes:     'Test thử trên vùng da nhỏ trước khi sử dụng chính thức.',
            },
        };

        return res.status(200).json({
            success: true,
            message: 'Product analysis successful',
            data:    analysisResult,
        });

    } catch (error) {
        console.error('Product analysis error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const saveDraft = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Please login to save draft' });
        }

        const { productName, productType, productIcon, ingredients, status, analysisResult } = req.body;

        const productData = {
            userId,
            productName,
            productType,
            productIcon,
            ingredients,
            status: status || 'draft',
        };

        if (analysisResult) productData.analysisResult = analysisResult;

        const savedProduct = await Collection.create(productData);

        return res.status(201).json({
            success: true,
            message: 'Product saved successfully',
            data:    savedProduct,
        });

    } catch (error) {
        console.error('Product save error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save product', error: error.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({ success: false, message: 'Please login to add product' });
        }

        const savedProduct = await collectionService.createProduct(userId, req.body);

        return res.status(201).json({
            success: true,
            message: 'Product saved successfully',
            data:    savedProduct,
        });

    } catch (error) {
        console.error('Product save error:', error);
        return res.status(500).json({ success: false, message: 'Failed to save product', error: error.message });
    }
};

// ============================================================
// B) COLLECTION CRUD HANDLERS — delegated to collectionService
// ============================================================

/** GET /collections?tab=active|used */
const listProducts = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tab = 'active' } = req.query;

        // Lazily bump expired products to expired_warning
        await collectionService.checkAndUpdateExpiryStatuses(userId);

        const products = await collectionService.getAllProducts(userId, { tab });

        return res.status(200).json({
            success:  true,
            message:  'Products fetched successfully',
            data:     products,
            products, // backward-compat alias
        });
    } catch (err) {
        console.error('[listProducts]', err.message);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** GET /collections/:id */
const getProduct = async (req, res) => {
    try {
        const product = await collectionService.getProductById(req.user.id, req.params.id);
        return res.status(200).json({ success: true, data: product, product });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** PATCH /collections/:id */
const editProduct = async (req, res) => {
    try {
        const product = await collectionService.updateProduct(req.user.id, req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật thành công',
            data:    product,
            product,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** DELETE /collections/:id */
const removeProduct = async (req, res) => {
    try {
        const result = await collectionService.deleteProduct(req.user.id, req.params.id);
        return res.status(200).json({
            success:      true,
            message:      result.wasInRoutine
                ? 'Sản phẩm đã được xóa. Hệ thống đã tự động điều chỉnh routine của bạn.'
                : 'Sản phẩm đã được xóa.',
            wasInRoutine: result.wasInRoutine,
            replacedWith: result.replacedWith,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** POST /collections/:id/finish */
const finishProduct = async (req, res) => {
    try {
        const result = await collectionService.markAsUsedUp(req.user.id, req.params.id);
        return res.status(200).json({
            success:      true,
            message:      result.wasInRoutine
                ? 'Sản phẩm đã được đánh dấu dùng hết. Routine đã được cập nhật.'
                : 'Sản phẩm đã được đánh dấu dùng hết.',
            data:         result.product,
            product:      result.product,
            wasInRoutine: result.wasInRoutine,
            replacedWith: result.replacedWith,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** GET /collections/expired-alerts */
const getExpiredAlerts = async (req, res) => {
    try {
        await collectionService.checkAndUpdateExpiryStatuses(req.user.id);
        const products = await collectionService.getExpiredWarningProducts(req.user.id);
        return res.status(200).json({ success: true, data: products });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

/** POST /collections/:id/resolve-expiry  body: { action: 'stop' | 'continue' } */
const resolveExpiredAlert = async (req, res) => {
    try {
        const { action } = req.body;
        const product = await collectionService.resolveExpiredProduct(req.user.id, req.params.id, action);
        return res.status(200).json({ success: true, data: product, product });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

module.exports = {
    // Scan-flow (unchanged)
    analyzeProduct,
    saveDraft,
    addProduct,
    // Collection CRUD
    listProducts,
    getProduct,
    editProduct,
    removeProduct,
    finishProduct,
    getExpiredAlerts,
    resolveExpiredAlert,
};
