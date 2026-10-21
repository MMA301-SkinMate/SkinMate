const { scanProductImage } = require('../services/scanService');
const fs = require('fs');

exports.scanImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No image file provided', code: 'NO_FILE' } });
    }

    const result = await scanProductImage(req.file.path);

    fs.unlink(req.file.path, err => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    res.json({ success: true, data: result });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, err => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    }
    next(error);
  }
};
