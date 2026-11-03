const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const User = require('../models/User');
const DailyRoutine = require('../models/DailyRoutine');
const TreatmentPlan = require('../models/TreatmentPlan');
const { calculateProductScores } = require('../services/analysisService');
const { analyzeProductByScores } = require('../services/geminiService');
const { uploadToCloudinary } = require('../services/cloudinaryService');


const serializeProduct = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const expDate = obj.expirationDate || obj.expiryDate || null;
    const noteText = obj.note || obj.notes || '';
    const pao = obj.paoMonths || (obj.paoDays ? Math.round(obj.paoDays / 30) : null);

    return {
        id: obj._id ? obj._id.toString() : obj.id,
        _id: obj._id ? obj._id.toString() : obj.id,
        userId: obj.userId,
        productName: obj.productName,
        productType: obj.productType,
        productIcon: obj.productIcon || 'serum',
        productImageUrl: obj.productImageUrl || null,
        ingredients: Array.isArray(obj.ingredients) ? obj.ingredients : [],
        analysisResult: obj.analysisResult || null,
        openedDate: obj.openedDate || null,
        expirationDate: expDate,
        expiryDate: expDate,
        paoMonths: pao,
        finalExpiryDate: obj.finalExpiryDate || null,
        note: noteText,
        notes: noteText,
        status: obj.status || 'active',
        continueAfterExpiry: Boolean(obj.continueAfterExpiry),
        routineUsage: obj.routineUsage || { morning: false, evening: false, step: null },
        brand: obj.brand || '',
        size: obj.size || '',
        remainingPercent: obj.remainingPercent !== undefined ? obj.remainingPercent : null,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
    };
};

const analyzeProduct = async (req, res) => {
    try {
        const { productName, productType, productIcon, ingredientList, userId: bodyUserId } = req.body;
        const ingredients = Array.isArray(ingredientList) && ingredientList.length > 0
            ? ingredientList
            : (Array.isArray(req.body.ingredients) ? req.body.ingredients : []);
        const userId = req.user?.id || bodyUserId || '65b123456789abcdef123456';

        let user = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await User.findById(userId);
        }
        if (!user) {
            user = await User.findOne();
        }
        if (!user) {
            user = await User.create({
                _id: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : new mongoose.Types.ObjectId(),
                email: 'demo@skinmate.com',
                passwordHash: 'demohash',
                fullName: 'SkinMate User',
                skinProfile: {
                    skinType: 'Da_Thuong',
                    customDos: [],
                    customDonts: []
                }
            }).catch(() => null);
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

        const userClosetProducts = user?._id
            ? await Collection.find({ userId: user._id, status: 'active' }).select('productName productType ingredients')
            : [];

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
        const bodyUserId = req.user?.id || req.body?.userId;
        const {
            productName,
            productType,
            productIcon = 'serum',
            productImageUrl,
            ingredients = [],
            status = 'draft',
            analysisResult
        } = req.body;

        const userId = bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId)
            ? bodyUserId
            : '65b123456789abcdef123456';

        const productData = {
            userId,
            productName: productName?.trim() || 'Sản phẩm chưa đặt tên',
            productType: productType || 'others',
            productIcon,
            productImageUrl: productImageUrl || null,
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            status: status || 'draft',
        };

        if (analysisResult) {
            productData.analysisResult = analysisResult;
        }

        const savedProduct = await Collection.create(productData);
        const serialized = serializeProduct(savedProduct);

        return res.status(201).json({
            success: true,
            message: 'Lưu bản nháp thành công',
            data: serialized,
            product: serialized,
        });

    } catch (error) {
        console.error('Product save draft error:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể lưu bản nháp',
            error: error.message
        });
    }
};

const addProduct = async (req, res) => {
    try {
        const {
            userId: bodyUserId,
            productName,
            productType,
            productIcon = 'serum',
            productImageUrl,
            ingredients = [],
            status = 'active',
            analysisResult,
            openedDate,
            expiryDate,
            expirationDate,
            paoMonths,
            finalExpiryDate,
            notes,
            note,
            continueAfterExpiry = false,
            routineUsage,
            brand,
            size,
            remainingPercent,
        } = req.body;

        const userId = req.user?.id || bodyUserId;
        if (!userId) {
            console.warn('[addProduct] Missing userId from request');
        }

        if (!productName || !productName.trim()) {
            return res.status(400).json({ success: false, message: 'Tên sản phẩm không được để trống' });
        }

        const expDate = expirationDate || expiryDate;
        const noteText = (note || notes || '').trim() || null;

        const productData = {
            userId: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(),
            productName: productName.trim(),
            productType: productType || 'others',
            productIcon: productIcon || 'serum',
            productImageUrl: productImageUrl || null,
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            status: status || 'active',
            openedDate: openedDate ? new Date(openedDate) : null,
            expirationDate: expDate ? new Date(expDate) : null,
            paoMonths: paoMonths ? Number(paoMonths) : null,
            finalExpiryDate: finalExpiryDate ? new Date(finalExpiryDate) : null,
            note: noteText,
            continueAfterExpiry: Boolean(continueAfterExpiry),
            routineUsage: routineUsage || { morning: false, evening: false, step: null },
            brand: brand || '',
            size: size || '',
            remainingPercent: remainingPercent !== undefined ? Number(remainingPercent) : null,
        };

        if (analysisResult) {
            productData.analysisResult = analysisResult;
        }

        const savedProduct = await Collection.create(productData);
        const serialized = serializeProduct(savedProduct);

        return res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm vào tủ đồ thành công',
            data: serialized,
            product: serialized,
        });

    } catch (error) {
        console.error('Product save error:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể thêm sản phẩm vào tủ đồ',
            error: error.message
        });
    }
};


const getAllProduct = async (req, res) => {
    try {
        const userId = req.user?.id || req.query?.userId || req.body?.userId;
        const { status, type, search, sort = 'newest' } = req.query;

        const filter = {};
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            filter.userId = userId;
        }

        // Lọc theo trạng thái tủ đồ
        if (status) {
            if (status === 'in_use' || status === 'active') {
                filter.status = 'active';
            } else if (status === 'used' || status === 'finished') {
                filter.status = { $in: ['finished', 'expired'] };
            } else if (status === 'expired') {
                filter.status = 'expired';
            } else if (status === 'draft') {
                filter.status = 'draft';
            } else {
                filter.status = status;
            }
        }

        // Lọc theo phân loại mỹ phẩm
        if (type) {
            filter.productType = type;
        }

        // Tìm kiếm theo tên sản phẩm
        if (search && search.trim()) {
            filter.productName = { $regex: search.trim(), $options: 'i' };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'expiry') {
            sortOption = { expirationDate: 1 };
        } else if (sort === 'name') {
            sortOption = { productName: 1 };
        }

        const rawProducts = await Collection.find(filter).sort(sortOption).lean();
        const products = rawProducts.map(serializeProduct);

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách sản phẩm thành công',
            total: products.length,
            data: products,
            products,
        });
    } catch (error) {
        console.error('Get all products error:', error);
        return res.status(500).json({
            success: false,
            message: 'Không thể lấy danh sách sản phẩm',
            error: error.message,
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.query?.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const query = { _id: id };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }

        const product = await Collection.findOne(query).lean();
        if (!product) {
            return res.status(404).json({ success: false, message: 'Not found product' });
        }

        const serialized = serializeProduct(product);
        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin sản phẩm thành công',
            data: serialized,
            product: serialized,
        });
    } catch (error) {
        console.error('Get product by id error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin sản phẩm',
            error: error.message,
        });
    }
};

/**
 * UC 21: Chỉnh sửa thông tin sản phẩm
 */
const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.body?.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const query = { _id: id };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }

        const {
            productName,
            productType,
            productIcon,
            productImageUrl,
            ingredients,
            analysisResult,
            openedDate,
            expiryDate,
            expirationDate,
            paoMonths,
            finalExpiryDate,
            note,
            notes,
            status,
            continueAfterExpiry,
            routineUsage,
            brand,
            size,
            remainingPercent,
        } = req.body;

        const updateData = {};
        if (productName !== undefined) updateData.productName = productName.trim();
        if (productType !== undefined) updateData.productType = productType;
        if (productIcon !== undefined) updateData.productIcon = productIcon;
        if (productImageUrl !== undefined) updateData.productImageUrl = productImageUrl;
        if (ingredients !== undefined) updateData.ingredients = Array.isArray(ingredients) ? ingredients : [];
        if (analysisResult !== undefined) updateData.analysisResult = analysisResult;
        if (openedDate !== undefined) updateData.openedDate = openedDate ? new Date(openedDate) : null;
        if (expirationDate !== undefined || expiryDate !== undefined) {
            const exp = expirationDate || expiryDate;
            updateData.expirationDate = exp ? new Date(exp) : null;
        }
        if (paoMonths !== undefined) updateData.paoMonths = paoMonths ? Number(paoMonths) : null;
        if (finalExpiryDate !== undefined) updateData.finalExpiryDate = finalExpiryDate ? new Date(finalExpiryDate) : null;
        if (note !== undefined || notes !== undefined) updateData.note = (note !== undefined ? note : notes) || null;
        if (status !== undefined) updateData.status = status;
        if (continueAfterExpiry !== undefined) updateData.continueAfterExpiry = Boolean(continueAfterExpiry);
        if (routineUsage !== undefined) updateData.routineUsage = routineUsage;
        if (brand !== undefined) updateData.brand = brand;
        if (size !== undefined) updateData.size = size;
        if (remainingPercent !== undefined) updateData.remainingPercent = remainingPercent !== null ? Number(remainingPercent) : null;

        const updated = await Collection.findOneAndUpdate(query, updateData, { new: true, runValidators: true }).lean();
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
        }

        const serialized = serializeProduct(updated);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: serialized,
            product: serialized,
        });
    } catch (error) {
        console.error('Edit product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm',
            error: error.message,
        });
    }
};

/**
 * UC 22 & 34: Xóa sản phẩm (có kiểm tra cảnh báo nếu sản phẩm đang dùng trong routine)
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.body?.userId || req.query?.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const query = { _id: id };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }

        const product = await Collection.findOne(query);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        // Kiểm tra xem sản phẩm có đang nằm trong TreatmentPlan active hay không
        let inRoutineWarning = false;
        try {
            if (TreatmentPlan && product.userId) {
                const activePlan = await TreatmentPlan.findOne({
                    userId: product.userId,
                    status: 'active',
                    'days.steps.productId': id,
                });
                if (activePlan) inRoutineWarning = true;
            }
        } catch {
            // Không chặn xóa nếu model TreatmentPlan chưa init
        }

        await Collection.deleteOne({ _id: id });

        return res.status(200).json({
            success: true,
            message: inRoutineWarning
                ? 'Sản phẩm đã được xóa. Lưu ý: Sản phẩm này từng nằm trong phác đồ của bạn, hệ thống sẽ tự động tìm sản phẩm thay thế.'
                : 'Xóa sản phẩm thành công',
            inRoutineWarning,
        });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm',
            error: error.message,
        });
    }
};

/**
 * UC 23: Đánh dấu dùng hết sản phẩm (chuyển sang tab Đã sử dụng)
 */
const markProductOutOfStock = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || req.body?.userId;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
        }

        const query = { _id: id };
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            query.userId = userId;
        }

        const updated = await Collection.findOneAndUpdate(
            query,
            { status: 'finished', remainingPercent: 0 },
            { new: true }
        ).lean();

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
        }

        const serialized = serializeProduct(updated);
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu sản phẩm dùng hết',
            data: serialized,
            product: serialized,
        });
    } catch (error) {
        console.error('Mark out of stock error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi đánh dấu sản phẩm đã dùng hết',
            error: error.message,
        });
    }
};

/**
 * Upload ảnh sản phẩm lên Cloudinary
 */
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh JPG, PNG, hoặc WebP' });
        }
        const result = await uploadToCloudinary(req.file, 'skinmate/collection');
        return res.status(201).json({
            success: true,
            message: 'Upload ảnh sản phẩm thành công',
            imageUrl: result.secureUrl,
            data: { imageUrl: result.secureUrl },
        });
    } catch (error) {
        console.error('Upload product image error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tải ảnh lên Cloudinary',
            error: error.message,
        });
    }
};

module.exports = {
    // Các hàm chính tường minh
    analyzeProduct,
    saveDraft,
    addProduct,
    getAllProduct,
    getProductById,
    editProduct,
    deleteProduct,
    markProductOutOfStock,
    uploadImage,

    // Aliases cho RESTful routes và các file đang gọi theo tên cũ
    list: getAllProduct,
    create: addProduct,
    get: getProductById,
    update: editProduct,
    remove: deleteProduct,
};
