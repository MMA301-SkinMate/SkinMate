require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY?.trim() || '';

if (!apiKey) {
    console.warn('⚠️ [SkinMate AI] Chưa cấu hình GEMINI_API_KEY trong file .env. Tính năng Scan AI sẽ tạm thời không hoạt động cho đến khi có API Key.');
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'missing_gemini_api_key' });

module.exports = ai;