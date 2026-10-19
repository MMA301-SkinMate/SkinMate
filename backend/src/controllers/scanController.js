const geminiService = require('../services/geminiService');
const scanService = require('../services/scanService');

const scanIngredients = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Chưa có ảnh tải lên để quét',
      });
    }

    const result = await geminiService.extractIngredientsFromImage(req.file);

    return res.status(200).json({
      success: true,
      message: 'Trích xuất thành phần từ ảnh thành công',
      data: result,
    });
  } catch (error) {
    console.error('ScanController Error:', error);
    let userMessage = 'Hệ thống gặp lỗi khi phân tích hình ảnh.';
    if (
      error.status === 429 ||
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED')
    ) {
      userMessage = 'Đạt giới hạn gọi API Gemini. Vui lòng thử lại sau giây lát.';
    } else if (
      error.status === 503 ||
      error.message?.includes('high demand') ||
      error.message?.includes('overloaded')
    ) {
      userMessage = 'Hệ thống AI đang quá tải. Vui lòng thử lại sau!';
    }
    return res.status(500).json({
      success: false,
      message: userMessage,
      error: error.message,
    });
  }
};

/**
 * 30. Phân tích độ phù hợp da (Score Calculator + Gemini Explanation)
 */
const analyzeSuitability = async (req, res, next) => {
  try {
    const { productName, brand, category, icon, ingredients, rawText } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách thành phần để phân tích',
      });
    }

    const analysis = await scanService.analyzeProductSuitability(
      req.user._id,
      {
        productName,
        brand,
        category,
        icon,
        ingredients,
        rawText,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Phân tích độ phù hợp da hoàn tất',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 31. Add sản phẩm từ ScanHistory vào tủ đồ
 */
const addScannedToCollection = async (req, res, next) => {
  try {
    const newProduct = await scanService.addScannedToCollection(
      req.user._id,
      req.params.id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: 'Đã lưu sản phẩm vào tủ đồ thành công',
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 32. List history scan
 */
const getScanHistory = async (req, res, next) => {
  try {
    const history = await scanService.getScanHistory(req.user._id);
    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 33. History scan detail
 */
const getScanHistoryDetail = async (req, res, next) => {
  try {
    const detail = await scanService.getScanHistoryDetail(
      req.user._id,
      req.params.id
    );
    return res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 34. Delete history record
 */
const deleteScanHistory = async (req, res, next) => {
  try {
    const result = await scanService.deleteScanHistory(
      req.user._id,
      req.params.id
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scanIngredients,
  analyzeSuitability,
  addScannedToCollection,
  getScanHistory,
  getScanHistoryDetail,
  deleteScanHistory,
};