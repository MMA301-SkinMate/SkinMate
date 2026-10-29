const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const client = new GoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const extractBase64FromImage = imagePath => {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
};

const getMimeType = filePath => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  return mimeTypes[ext] || 'image/jpeg';
};

exports.scanProductImage = async imagePath => {
  try {
    const base64Data = extractBase64FromImage(imagePath);
    const mimeType = getMimeType(imagePath);

    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
      {
        text: `Analyze this skincare product image and extract:
1. Product name (if visible on label)
2. Brand name (if visible)
3. Main ingredients (list the most important ones visible or commonly in this type of product)
4. Product type (cleanser, toner, essences, cream, oil, serum, treatment, moisturizer, sunscreen, mask, exfoliant, others)

Return the response in this exact JSON format:
{
  "productName": "string or null",
  "brand": "string or null",
  "ingredients": ["ingredient1", "ingredient2", ...],
  "productType": "one of: cleanser, toner, essences, cream, oil, serum, treatment, moisturizer, sunscreen, mask, exfoliant, others"
}

If you cannot determine a field with reasonable confidence, use null for that field.`,
      },
    ]);

    const textContent = response.response.text();
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        productName: null,
        brand: null,
        ingredients: [],
        productType: 'others',
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    let scannedType = (parsed.productType || '').toLowerCase().trim();
    if (scannedType === 'other') scannedType = 'others';
    if (scannedType === 'essence') scannedType = 'essences';
    const validTypes = ['cleanser', 'toner', 'essences', 'cream', 'oil', 'serum', 'treatment', 'moisturizer', 'sunscreen', 'mask', 'exfoliant', 'others'];

    return {
      productName: parsed.productName || null,
      brand: parsed.brand || null,
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.filter(i => i && typeof i === 'string') : [],
      productType: validTypes.includes(scannedType) ? scannedType : 'others',
    };
  } catch (error) {
    console.error('Scan service error:', error);
    throw new Error(`Failed to scan image: ${error.message}`, { cause: error });
  }
};
