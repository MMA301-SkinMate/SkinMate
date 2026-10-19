require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDummyKeyForDevelopmentWhenNoKeyProvided';

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ Missing GEMINI_API_KEY in .env file. AI features will fallback to rule-based algorithms.');
}

const ai = new GoogleGenAI({ apiKey });

module.exports = ai;