const ScanHistory = require('../models/ScanHistory');
const Collection = require('../models/Collection');
const DailyRoutine = require('../models/DailyRoutine');
const User = require('../models/User');
const ai = require('../config/AI');
const {
  calculateSuitabilityScore,
  normalizeStr,
} = require('../utils/scoreCalculator');

/**
 * Phân tích độ phù hợp da (Mục 30)
 * Kết hợp Thuật toán tính điểm 4 bước và LLM Gemini
 */
const analyzeProductSuitability = async (userId, payload) => {
  const { productName, brand, category, icon, ingredients, rawText, skinType, currentConditions } = payload;
  const user = userId ? await User.findById(userId) : null;
  const userSkinType = skinType || (user ? user.skinType : 'Da_Dau');
  const userConditions = currentConditions || (user ? user.currentConditions : ['Bình thường']);

  // Lấy routine hôm nay để lấy danh sách thành phần đang dùng
  const routineIngredients = [];
  let closetNames = '';

  if (userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDaily = await DailyRoutine.findOne({
      user: userId,
      date: todayStr,
    }).populate('morningSteps.product eveningSteps.product');

    if (todayDaily) {
      const allSteps = todayDaily.morningSteps.concat(todayDaily.eveningSteps);
      allSteps.forEach((s) => {
        const prod = s.product || s.customProduct;
        if (prod && prod.ingredients) {
          routineIngredients.push(...prod.ingredients);
        }
      });
    }

    // Lấy danh sách tủ đồ để tìm best pairing
    const closet = await Collection.find({ user: userId, status: 'active' });
    closetNames = closet.map((c) => c.productName).join(', ');
  }

  // 1. Chạy Thuật toán chấm điểm chuẩn y khoa (Mục 30)
  const scoreResult = calculateSuitabilityScore({
    ingredients,
    skinType: userSkinType,
    currentConditions: userConditions,
    routineIngredients,
  });

  // 2. Gọi Gemini LLM để sinh lời khuyên chuyên gia da liễu
  let aiExplanation = '';
  let conflictResolution = '';
  let bestPairingInCloset = '';
  let futurePlan = '';

  const prompt = `
Bạn là một bác sĩ chuyên khoa da liễu giàu kinh nghiệm. Hệ thống thuật toán y khoa của chúng tôi vừa chấm điểm sản phẩm "${productName || 'Mỹ phẩm'}" đạt [${scoreResult.finalScore}%] độ phù hợp (Độ phù hợp nền da là [${scoreResult.baseScore}%]).
Thông tin người dùng:
- Loại da gốc: ${userSkinType}
- Tình trạng da hôm nay: ${(Array.isArray(userConditions) ? userConditions : [userConditions]).join(', ')}
- Danh sách thành phần của sản phẩm: ${ingredients.join(', ')}
- Daily Routine hôm nay gồm: ${routineIngredients.join(', ') || 'Chưa thiết lập'}
- Tủ đồ mỹ phẩm hiện có: ${closetNames || 'Chưa có sản phẩm'}

Dựa vào điểm số ${scoreResult.finalScore}% và dữ liệu trên, hãy giải thích lý do cho điểm số này và trả về JSON thuần túy (không markdown) theo cấu trúc:
{
  "verdict": "Đánh giá súc tích 1-2 câu",
  "explanation": "Giải thích chi tiết nguyên nhân khoa học vì sao đạt điểm số này",
  "conflict_resolution": "Hướng dẫn cách dùng hoặc cảnh báo xung đột nếu có",
  "best_pairing_in_closet": "Gợi ý sản phẩm nào trong tủ đồ kết hợp cùng sẽ mang lại hiệu quả cao nhất",
  "future_plan": "Kế hoạch sử dụng trong 7-14 ngày tới (tần suất, buổi sáng hay tối)"
}
`;

  try {
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');
    aiExplanation = parsed.explanation || '';
    conflictResolution = parsed.conflict_resolution || '';
    bestPairingInCloset = parsed.best_pairing_in_closet || '';
    futurePlan = parsed.future_plan || '';
  } catch (err) {
    console.warn('[scanService] AI generation fallback:', err.message);
    aiExplanation = `Sản phẩm đạt ${scoreResult.finalScore}% độ phù hợp với nền da ${userSkinType}. Điểm đánh giá dựa trên thành phần khuyến nghị và cấm kỵ của tình trạng da hiện tại.`;
    conflictResolution = scoreResult.matchedConflicts.length > 0
      ? `Cảnh báo: Có xung đột hoạt chất với routine hôm nay. Tránh bôi chung cùng buổi!`
      : 'Không phát hiện xung đột đáng kể với chu trình chăm sóc da hiện tại.';
    bestPairingInCloset = 'Kết hợp cùng kem dưỡng phục hồi và kem chống nắng để tối ưu bảo vệ da.';
    futurePlan = 'Bắt đầu sử dụng 2-3 lần/tuần vào buổi tối để theo dõi phản ứng của da.';
  }

  // 3. Lưu vào ScanHistory làm bản nháp nếu user đã đăng nhập
  let historyRecord = null;
  if (userId) {
    historyRecord = await ScanHistory.create({
      user: userId,
      productName: productName || 'Sản phẩm đã phân tích',
      brand: brand || 'Chưa rõ',
      category: category || 'other',
      icon: icon || 'bottle',
      ingredients,
      analysisResult: {
        score: scoreResult.finalScore,
        baseScore: scoreResult.baseScore,
        verdict: scoreResult.verdict,
        pros: scoreResult.matchedDos.concat(
          scoreResult.matchedTreatments.map((t) => `${t.ingredient} (Trị liệu ${t.condition})`)
        ),
        cons: scoreResult.matchedDonts.concat(
          scoreResult.matchedBanned.map((b) => `${b.ingredient} (Kỵ với ${b.condition})`),
          scoreResult.matchedConflicts.map((c) => `${c.ingredient} kỵ với ${c.conflictsWith}`)
        ),
        conflictResolution,
        bestPairingInCloset,
        futurePlan,
        aiExplanation,
      },
    });
  }

  return {
    scanHistoryId: historyRecord ? historyRecord._id : null,
    productName: productName || 'Sản phẩm đã phân tích',
    brand: brand || 'Chưa rõ',
    category: category || 'other',
    icon: icon || 'bottle',
    ingredients,
    scoreResult,
    aiDetails: {
      aiExplanation,
      conflictResolution,
      bestPairingInCloset,
      futurePlan,
    },
  };
};

/**
 * 31. Add sản phẩm từ ScanHistory vào tủ đồ
 */
const addScannedToCollection = async (userId, scanHistoryId, extraData = {}) => {
  const scanRecord = await ScanHistory.findOne({
    _id: scanHistoryId,
    user: userId,
  });
  if (!scanRecord) {
    throw new Error('Không tìm thấy bản ghi quét');
  }

  const newProduct = await Collection.create({
    user: userId,
    productName: extraData.productName || scanRecord.productName,
    brand: extraData.brand || scanRecord.brand,
    category: extraData.category || scanRecord.category,
    icon: extraData.icon || scanRecord.icon,
    ingredients: scanRecord.ingredients,
    suitabilityScore: scanRecord.analysisResult?.score || 70,
    openedDate: extraData.openedDate || new Date(),
    expiryDate: extraData.expiryDate || null,
    periodAfterOpeningMonths: extraData.periodAfterOpeningMonths || null,
    notes: extraData.notes || '',
    status: 'active',
  });

  scanRecord.isAddedToCollection = true;
  await scanRecord.save();

  return newProduct;
};

/**
 * 32. List history scan
 */
const getScanHistory = async (userId) => {
  return await ScanHistory.find({ user: userId }).sort({ createdAt: -1 });
};

/**
 * 33. History scan detail
 */
const getScanHistoryDetail = async (userId, historyId) => {
  const record = await ScanHistory.findOne({ _id: historyId, user: userId });
  if (!record) {
    throw new Error('Không tìm thấy bản ghi lịch sử scan');
  }
  return record;
};

/**
 * 34. Delete history record
 */
const deleteScanHistory = async (userId, historyId) => {
  const res = await ScanHistory.deleteOne({ _id: historyId, user: userId });
  if (res.deletedCount === 0) {
    throw new Error('Không tìm thấy bản ghi cần xóa');
  }
  return { success: true, message: 'Đã xóa bản ghi quét thành công' };
};

module.exports = {
  analyzeProductSuitability,
  addScannedToCollection,
  getScanHistory,
  getScanHistoryDetail,
  deleteScanHistory,
};
