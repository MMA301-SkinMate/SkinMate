const geminiService = require('../services/geminiService');

const scanIngredients = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const result = await geminiService.extractIngredientsFromImage(req.file);

        return res.status(200).json({
            success: true,
            message: 'Extract ingredients success',
            data: result,
        });
    } catch (error) {
        console.error('ScanController Error:', error);
        let userMessage = 'System error when reading image.';
        if (error.status === 503 || error.message?.includes('high demand')) {
            userMessage = 'System is temporarily overloaded. Please try again later!';
        }
        return res.status(500).json({
            success: false,
            message: userMessage,
        });
    }
};

module.exports = {
    scanIngredients,
};