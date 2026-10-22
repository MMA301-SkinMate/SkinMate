const multer = require('multer');
const path = require('path');
const fs = require('fs');

const allowedMimeTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const imageFilter = (req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype));

// Builds a disk-backed image uploader that stores files under uploads/<folder>.
const createImageUpload = (folder, prefix) => {
  const uploadDir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, uploadDir),
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
      callback(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
  });

  return multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });
};

const createMemoryImageUpload = () => multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Only JPG, PNG, or WebP images are allowed');
      error.code = 'INVALID_IMAGE';
      return callback(error);
    }
    callback(null, true);
  },
});

module.exports = createImageUpload('products', 'product');
module.exports.createImageUpload = createImageUpload;
module.exports.createMemoryImageUpload = createMemoryImageUpload;
