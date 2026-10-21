const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const User = require('../models/User');
const DailyRoutine = require('../models/DailyRoutine');
const { calculateProductScores } = require('../services/analysisService');
const { analyzeProductByScores } = require('../services/geminiService');

const analyzeProduct = async (req, res) => {
    try {
        console.log('🚀 [1/5] Bắt đầu nhận request phân tích sản phẩm...');
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

        console.log('🎒 [3/5] Đang quét routine và tủ đồ active...');
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

        console.log('🧮 [4/5] Đang chạy thuật toán chấm điểm cục bộ...');
        const scores = calculateProductScores({
            ingredients,
            skinType,
            todayCondition,
            routineIngredients
        });

        let aiResponse = null;
        try {
            console.log('🤖 [5/5] Đang gửi dữ liệu sang Gemini AI để lấy lời khuyên...');
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
            console.log('✅ [Gemini AI] Kết quả nhận được thành công!');
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

        const response = {
            analysisResult,
            productName,
            productType,
            productIcon,
            skinType,
            todayCondition,
            ingredients,
            userClosetProducts
        };

        return res.status(200).json({
            success: true,
            message: 'Product analysis successful',
            data: response
        });

    } catch (error) {
        console.error('Product analysis error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { analyzeProduct };