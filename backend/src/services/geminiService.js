const ai = require('../config/AI');

// Fallback models in case one hits rate limit (429) or high demand (503)
const CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
];

const safeParseJson = (rawText) => {
    if (!rawText) return null;
    const text = rawText.trim();
    // 1. Try markdown code block
    const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (mdMatch && mdMatch[1]) {
        try {
            return JSON.parse(mdMatch[1].trim());
        } catch (_) { }
    }
    // 2. Try outermost braces {}
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(text.slice(firstBrace, lastBrace + 1));
        } catch (_) { }
    }
    // 3. Try outermost brackets []
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        try {
            return JSON.parse(text.slice(firstBracket, lastBracket + 1));
        } catch (_) { }
    }
    // 4. Direct parse safely
    try {
        return JSON.parse(text);
    } catch (_) {
        return null;
    }
};

const normalizeIngredients = (parsed) => {
    if (!parsed) return { ingredients: [] };

    let rawList = [];
    if (Array.isArray(parsed)) {
        rawList = parsed;
    } else if (typeof parsed === 'object') {
        if (Array.isArray(parsed.ingredients)) {
            rawList = parsed.ingredients;
        } else if (Array.isArray(parsed.ingredientList)) {
            rawList = parsed.ingredientList;
        } else if (Array.isArray(parsed.ingredient_list)) {
            rawList = parsed.ingredient_list;
        } else if (Array.isArray(parsed.data)) {
            rawList = parsed.data;
        } else if (typeof parsed.ingredients === 'string') {
            rawList = parsed.ingredients.split(/[,;\n•\r]+/);
        } else {
            const firstArrayProp = Object.values(parsed).find(val => Array.isArray(val));
            if (firstArrayProp) {
                rawList = firstArrayProp;
            }
        }
    } else if (typeof parsed === 'string') {
        rawList = parsed.split(/[,;\n•\r]+/);
    }

    const cleanIngredients = rawList
        .map(item => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object') {
                return (item.name || item.ingredient || item.text || '').toString().trim();
            }
            return String(item || '').trim();
        })
        .map(item => item.replace(/^[-*•\d.)\s]+/, '').trim())
        .filter(item => item.length > 1 && !/^(ingredients|thành phần):?$/i.test(item));

    // Remove duplicates while preserving case
    const seen = new Set();
    const uniqueIngredients = [];
    for (const ing of cleanIngredients) {
        const lower = ing.toLowerCase();
        if (!seen.has(lower)) {
            seen.add(lower);
            uniqueIngredients.push(ing);
        }
    }

    return {
        ingredients: uniqueIngredients,
    };
};

const readIngredientsFromImage = async (file) => {
    if (!file || !file.buffer) {
        throw new Error('No valid image file buffer provided');
    }

    const mimeType = file.mimetype && file.mimetype.startsWith('image/')
        ? file.mimetype
        : 'image/jpeg';

    const imagePart = {
        inlineData: {
            data: file.buffer.toString('base64'),
            mimeType,
        },
    };

    const prompt = `
        Hãy đọc kỹ bức ảnh chứa bảng thành phần mỹ phẩm này. 
        Nhiệm vụ của bạn là trích xuất toàn bộ các chất có trong bảng thành phần thành một danh sách.
        Trả về kết quả duy nhất dưới định dạng JSON thuần túy theo cấu trúc sau:
        {
            "ingredients": ["Water", "Glycerin", "Niacinamide"]
        }
    `;

    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
        try {
            console.log(`[geminiService] Attempting to read image with model ${model}...`);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_25S')), 25000)
            );
            const generatePromise = ai.models.generateContent({
                model,
                contents: [imagePart, prompt],
                config: {
                    responseMimeType: 'application/json',
                },
            });

            const response = await Promise.race([generatePromise, timeoutPromise]);
            const parsed = safeParseJson(response.text);
            if (parsed) {
                const normalized = normalizeIngredients(parsed);
                console.log(`[geminiService] Model ${model} successfully extracted ${normalized.ingredients.length} ingredients.`);
                return normalized;
            }
        } catch (error) {
            console.warn(
                `[geminiService] Model ${model} failed:`,
                error.message || error
            );
            lastError = error;
            // If rate-limited or unavailable, continue to next model
            if (
                error.status === 429 ||
                error.status === 503 ||
                error.message?.includes('quota') ||
                error.message?.includes('high demand')
            ) {
                continue;
            }
            // For other critical errors, rethrow or try next model
            continue;
        }
    }

    throw lastError || new Error('All Gemini models failed to process image');
};

const analyzeProductByScores = async ({
    productName = 'Sản phẩm',
    productType = 'Khác',
    baseScore = 70,
    contextualScore = 70,
    skinType = 'Da_Thuong',
    todayCondition = 'Binh_Thuong',
    ingredients = [],
    userClosetProducts = []
}) => {
    const closetInfo = userClosetProducts.length > 0
        ? userClosetProducts.map(p => `- ${p.productName} (${p.productType}): [${(p.ingredients || []).join(', ')}]`).join('\n')
        : 'There is no product in the closet.';

    const ingredientsStr = ingredients.length > 0
        ? ingredients.join(', ')
        : 'Chưa có thông tin thành phần cụ thể (phân tích dựa trên tên và phân loại sản phẩm)';

    const prompt = `
        Bạn là chuyên gia da liễu hàng đầu. 
        Hệ thống đang phân tích sản phẩm cho người dùng với thông tin sau:
        - Tên sản phẩm: ${productName}
        - Loại sản phẩm: ${productType}
        - Điểm nền da gốc: ${baseScore}%
        - Điểm bối cảnh hôm nay: ${contextualScore}%
        - Loại da user: ${skinType}
        - Tình trạng da hôm nay: ${todayCondition}
        - Thành phần quét được: ${ingredientsStr}

        Danh sách sản phẩm ĐANG CÓ TRONG TỦ ĐỒ của người dùng:
        ${closetInfo}

        Yêu cầu phân tích và trả về ĐÚNG định dạng JSON (tuyệt đối không kèm ký tự markdown nào khác ngoài JSON). Hãy tách bạch các trường để UI app dễ hiển thị:
        {
        "verdict": {
            "text": "Nhận xét tổng quan ngắn gọn về độ phù hợp...",
            "badgeLevel": "success" // Dùng để định màu UI: 'success' (xanh), 'warning' (vàng/cam), hoặc 'danger' (đỏ)
        },
        "conflict_resolution": {
            "hasConflict": false, // true nếu có kỵ nhau, false nếu an toàn
            "details": "Giải thích chi tiết nếu có xung đột hoạt chất với tủ đồ hoặc routine..."
        },
        "pairing_recommendation": {
            "matchedProductInCloset": "Tên chính xác sản phẩm trong tủ đồ kết hợp tốt nhất (hoặc để null nếu không có)",
            "advice": "Hướng dẫn cách kết hợp...",
            "ingredientsToAdd": ["Hoạt chất 1 nên bổ sung", "Hoạt chất 2"],
            "ingredientsToAvoid": ["Hoạt chất kỵ 1 cần tránh", "Hoạt chất 2"]
        },
        "future_plan": {
            "frequency": "Tần suất khuyên dùng (ví dụ: 2-3 lần/tuần)",
            "timing": "Thời điểm (Sáng / Tối)",
            "notes": "Lưu ý thêm khi sử dụng chu trình dài hạn..."
        }
        }
        `;

    const normalizeResult = (parsed = {}) => {
        const defaultBadge = contextualScore >= 80 ? 'success' : contextualScore >= 50 ? 'warning' : 'danger';

        const verdict = typeof parsed.verdict === 'object' && parsed.verdict !== null
            ? {
                text: parsed.verdict.text || `Sản phẩm có độ phù hợp bối cảnh là ${contextualScore}%.`,
                badgeLevel: parsed.verdict.badgeLevel || defaultBadge,
            }
            : {
                text: typeof parsed.verdict === 'string' ? parsed.verdict : `Sản phẩm có độ phù hợp bối cảnh là ${contextualScore}%.`,
                badgeLevel: defaultBadge,
            };

        const conflictRaw = parsed.conflict_resolution || parsed.conflictResolution;
        const conflictResolution = typeof conflictRaw === 'object' && conflictRaw !== null
            ? {
                hasConflict: Boolean(conflictRaw.hasConflict),
                details: conflictRaw.details || 'Chưa phát hiện xung đột hoạt chất nghiêm trọng với routine/tủ đồ.',
            }
            : {
                hasConflict: false,
                details: typeof conflictRaw === 'string' ? conflictRaw : 'Chưa phát hiện xung đột hoạt chất nghiêm trọng với routine/tủ đồ.',
            };

        const pairingRaw = parsed.pairing_recommendation || parsed.pairingRecommendation || parsed.best_pairing_in_closet || parsed.bestPairingInCloset;
        const pairingRecommendation = typeof pairingRaw === 'object' && pairingRaw !== null
            ? {
                matchedProductInCloset: pairingRaw.matchedProductInCloset || null,
                advice: pairingRaw.advice || 'Nên kết hợp cùng các sản phẩm phục hồi dịu nhẹ chứa Panthenol (B5), Ceramide hoặc Hyaluronic Acid.',
                ingredientsToAdd: Array.isArray(pairingRaw.ingredientsToAdd) ? pairingRaw.ingredientsToAdd : ['Panthenol (B5)', 'Ceramide'],
                ingredientsToAvoid: Array.isArray(pairingRaw.ingredientsToAvoid) ? pairingRaw.ingredientsToAvoid : [],
            }
            : {
                matchedProductInCloset: null,
                advice: typeof pairingRaw === 'string' ? pairingRaw : 'Nên kết hợp cùng các sản phẩm phục hồi dịu nhẹ chứa Panthenol (B5), Ceramide hoặc Hyaluronic Acid.',
                ingredientsToAdd: ['Panthenol (B5)', 'Ceramide'],
                ingredientsToAvoid: [],
            };

        const planRaw = parsed.future_plan || parsed.futurePlan;
        const futurePlan = typeof planRaw === 'object' && planRaw !== null
            ? {
                frequency: planRaw.frequency || '2 - 3 lần / tuần',
                timing: planRaw.timing || 'Buổi tối',
                notes: planRaw.notes || 'Nên thử trên vùng da nhỏ ở quai hàm trước khi thoa đều toàn mặt.',
            }
            : {
                frequency: '2 - 3 lần / tuần',
                timing: 'Buổi tối',
                notes: typeof planRaw === 'string' ? planRaw : 'Nên thử trên vùng da nhỏ ở quai hàm trước khi thoa đều toàn mặt.',
            };

        return {
            verdict,
            conflictResolution,
            pairingRecommendation,
            futurePlan,
        };
    };

    for (const model of CANDIDATE_MODELS) {
        try {
            console.log(`[geminiService] Calling model ${model}...`);
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT_18S')), 18000)
            );
            const generatePromise = ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                },
            });

            const response = await Promise.race([generatePromise, timeoutPromise]);
            const parsed = safeParseJson(response.text);
            if (parsed) {
                console.log(`[geminiService] Model ${model} successfully returned analysis!`);
                return normalizeResult(parsed);
            }
        } catch (error) {
            console.warn(`[geminiService] Model ${model} failed in analyzeProductByScores:`, error.message);
            continue;
        }
    }

    console.warn('[geminiService] All Gemini models failed or timed out. Falling back to local score-based evaluation.');
    return normalizeResult({});
};

module.exports = {
    readIngredientsFromImage,
    analyzeProductByScores
};
