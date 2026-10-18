const ai = require('../config/AI');

const extractIngredientsFromImage = async (file) => {
    const imagePart = {
        inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype,
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

    const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [imagePart, prompt],
        config: {
            responseMimeType: 'application/json',
        },
    });

    const rawText = (response.text || '').trim();
    const cleanJsonString = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');

    try {
        return JSON.parse(cleanJsonString);
    } catch (parseError) {
        console.error('JSON Parse Error:', parseError.message);
        console.log('Raw AI Text:', response.text);
        return {
            ingredients: [],
            rawText: response.text,
            message: 'Failed to parse JSON from AI response.',
        };
    }
};

module.exports = {
    extractIngredientsFromImage,
};