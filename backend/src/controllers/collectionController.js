const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const User = require('../models/User');
const DailyRoutine = require('../models/DailyRoutine');
const { calculateProductScores } = require('../services/analysisService');
const { analyzeProductByScores } = require('../services/geminiService');

const analyzeProduct = async (req, res) => {
    try {
        const { productName, productType, productIcon, ingredientList, userId: bodyUserId } = req.body;
        const ingredients = Array.isArray(ingredientList) && ingredientList.length > 0
            ? ingredientList
            : (Array.isArray(req.body.ingredients) ? req.body.ingredients : []);

        const userId = req.user?.id || bodyUserId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để phân tích sản phẩm',
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng',
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

        const userClosetProducts = await Collection.find({ userId: user._id, status: 'active' }).select('productName productType ingredients');

        const scores = calculateProductScores({
            ingredients,
            skinType,
            todayCondition,
            routineIngredients
        });

        let aiResponse = null;
        try {
            aiResponse = await analyzeProductByScores({
                productName,
                productType,
                baseScore: scores.baseScore,
                contextualScore: scores.contextualScore,
                skinType,
                todayCondition,
                ingredients,
                userClosetProducts
            });
        } catch (aiError) {
            console.warn('[collectionController] AI analysis error, using fallback:', aiError.message);
        }

        const analysisResult = {
            baseScore: scores.baseScore,
            contextualScore: scores.contextualScore,
            verdict: aiResponse?.verdict || {
                text: `Sản phẩm có độ phù hợp ${scores.contextualScore}% với tình trạng da hiện tại.`,
                badgeLevel: scores.contextualScore >= 80 ? 'success' : scores.contextualScore >= 50 ? 'warning' : 'danger',
            },
            conflictResolution: aiResponse?.conflictResolution || {
                hasConflict: false,
                details: 'Chưa phát hiện xung đột hoạt chất nghiêm trọng với chu trình hiện tại.',
            },
            pairingRecommendation: aiResponse?.pairingRecommendation || {
                matchedProductInCloset: null,
                advice: 'Nên chọn thêm các sản phẩm phục hồi dịu nhẹ.',
                ingredientsToAdd: ['Panthenol (B5)', 'Ceramide'],
                ingredientsToAvoid: [],
            },
            futurePlan: aiResponse?.futurePlan || {
                frequency: '2 - 3 lần / tuần',
                timing: 'Buổi tối',
                notes: 'Test thử trên vùng da nhỏ trước khi sử dụng chính thức.',
            },
        };

        return res.status(200).json({
            success: true,
            message: 'Product analysis successful',
            data: analysisResult
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
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để lưu bản nháp',
            });
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

        if (analysisResult) {
            productData.analysisResult = analysisResult;
        }

        const savedProduct = await Collection.create(productData);

        return res.status(201).json({
            success: true,
            message: 'Product saved successfully',
            data: savedProduct
        });

    } catch (error) {
        console.error('Product save error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save product',
            error: error.message
        });
    }
};

const addProduct = async (req, res) => {
    try {
        const userId = req.user?.id || req.body?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để thêm sản phẩm',
            });
        }

        const {
            productName,
            productType,
            productIcon,
            ingredients,
            status,
            analysisResult,
            openedDate,
            expiryDate,
            expirationDate,
            paoMonths,
            finalExpiryDate,
            notes,
            note,
            continueAfterExpiry,
            routineUsage,
        } = req.body;

        const productData = {
            userId,
            productName,
            productType,
            productIcon,
            ingredients,
            status: status || 'active',
            openedDate: openedDate || null,
            expirationDate: expirationDate || expiryDate || null,
            paoMonths: paoMonths || null,
            finalExpiryDate: finalExpiryDate || null,
            note: note || notes || null,
            continueAfterExpiry: continueAfterExpiry || false,
            routineUsage: routineUsage || { morning: false, evening: false, step: null },
        };

        if (analysisResult) {
            productData.analysisResult = analysisResult;
        }

        const savedProduct = await Collection.create(productData);

        return res.status(201).json({
            success: true,
            message: 'Product saved successfully',
            data: savedProduct
        });

    } catch (error) {
        console.error('Product save error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save product',
            error: error.message
        });
    }
};

const getAllProduct = async (req, res) => {
    try {
        const userId = req.user?.id || req.query?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để xem tủ đồ',
            });
        }

        const { status, type, search } = req.query;
        const filter = { userId };

        if (status) {
            if (status === 'in_use' || status === 'active') {
                filter.status = 'active';
            } else if (status === 'used' || status === 'finished') {
                filter.status = { $in: ['finished', 'expired'] };
            } else if (status === 'draft') {
                filter.status = 'draft';
            } else if (status === 'expired') {
                filter.status = 'expired';
            } else {
                filter.status = status;
            }
        }

        if (type) {
            filter.productType = type;
        }

        if (search && search.trim()) {
            filter.productName = { $regex: search.trim(), $options: 'i' };
        }

        const products = await Collection.find(filter).sort({ createdAt: -1 }).lean();

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            data: products,
            products,
        });
    } catch (error) {
        console.error('Get all products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get products',
            error: error.message,
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const filter = { _id: id };
        if (userId) filter.userId = userId;

        const product = await Collection.findOne(filter).lean();
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: product,
            product,
        });
    } catch (error) {
        console.error('Get product by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get product',
            error: error.message,
        });
    }
};

const editProduct = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const filter = { _id: id };
        if (userId) filter.userId = userId;

        const {
            productName,
            productType,
            productIcon,
            ingredients,
            analysisResult,
            openedDate,
            expiryDate,
            expirationDate,
            paoMonths,
            finalExpiryDate,
            notes,
            note,
            status,
            continueAfterExpiry,
            routineUsage,
        } = req.body;

        const updateData = {};
        if (productName !== undefined) updateData.productName = productName;
        if (productType !== undefined) updateData.productType = productType;
        if (productIcon !== undefined) updateData.productIcon = productIcon;
        if (ingredients !== undefined) updateData.ingredients = ingredients;
        if (analysisResult !== undefined) updateData.analysisResult = analysisResult;
        if (openedDate !== undefined) updateData.openedDate = openedDate;
        if (expirationDate !== undefined || expiryDate !== undefined) {
            updateData.expirationDate = expirationDate || expiryDate;
        }
        if (paoMonths !== undefined) updateData.paoMonths = paoMonths;
        if (finalExpiryDate !== undefined) updateData.finalExpiryDate = finalExpiryDate;
        if (note !== undefined || notes !== undefined) updateData.note = note || notes;
        if (status !== undefined) updateData.status = status;
        if (continueAfterExpiry !== undefined) updateData.continueAfterExpiry = continueAfterExpiry;
        if (routineUsage !== undefined) updateData.routineUsage = routineUsage;

        const updated = await Collection.findOneAndUpdate(filter, updateData, { new: true, runValidators: true }).lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: updated,
            product: updated,
        });
    } catch (error) {
        console.error('Edit product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const filter = { _id: id };
        if (userId) filter.userId = userId;

        const deleted = await Collection.findOneAndDelete(filter);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
        }

        return res.status(200).json({
            success: true,
            message: 'Xóa sản phẩm thành công',
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message,
        });
    }
};

const markProductOutOfStock = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const filter = { _id: id };
        if (userId) filter.userId = userId;

        const updated = await Collection.findOneAndUpdate(
            filter,
            { status: 'finished' },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu sản phẩm dùng hết',
            data: updated,
            product: updated,
        });
    } catch (error) {
        console.error('Mark out of stock error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark product out of stock',
            error: error.message,
        });
    }
};

module.exports = {
    analyzeProduct,
    saveDraft,
    addProduct,
    getAllProduct,
    getProductById,
    editProduct,
    deleteProduct,
    markProductOutOfStock,

    // Aliases
    list: getAllProduct,
    create: addProduct,
    get: getProductById,
    update: editProduct,
    remove: deleteProduct,
};
