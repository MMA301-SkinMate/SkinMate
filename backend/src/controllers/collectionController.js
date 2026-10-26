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
        const { userId = '65b123456789abcdef123456', productName, productType, productIcon, ingredients, status, analysisResult } = req.body;

        if (!userId) {
            console.warn('[saveDraft] Missing userId from request body');
        }

        const productData = {
            userId,
            productName,
            productType,
            productIcon,
            ingredients,
            status,
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
        const { userId, productName, productType, productIcon, ingredients, status, analysisResult, openedDate, expiryDate, paoMonths, finalExpiryDate, notes } = req.body;

        if (!userId) {
            console.warn('[saveDraft] Missing userId from request body');
        }

        const productData = {
            userId,
            productName,
            productType,
            productIcon,
            ingredients,
            status,
            openedDate,
            expiryDate,
            paoMonths,
            finalExpiryDate,
            notes
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

const getScanHistory = async (req, res) => {
    try {
        const userId = req.query.userId || req.params.userId || '65b123456789abcdef123456';

        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const historyList = await Collection.find({ userId, status: 'draft' })
            .sort({ createdAt: -1 })
            .select('productName productType productIcon ingredients createdAt analysisResult');

        res.status(200).json({
            success: true,
            count: historyList.length,
            data: historyList,
        });
    } catch (error) {
        console.error('Error getting scan history:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { analyzeProduct, saveDraft, addProduct, getScanHistory };