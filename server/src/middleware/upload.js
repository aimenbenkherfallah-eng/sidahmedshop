const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { MAX_IMAGE_SIZE_MB, MAX_LANDING_IMAGE_SIZE_MB, MAX_IMAGES_PER_PRODUCT, MAX_REVIEW_PHOTOS } = require('../config/constants');
const AppError = require('../utils/AppError');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError('Only image files are allowed.', 400));
  }
  cb(null, true);
};

const productImagesUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: MAX_IMAGES_PER_PRODUCT },
});

const adminProductUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_LANDING_IMAGE_SIZE_MB * 1024 * 1024,
    files: MAX_IMAGES_PER_PRODUCT + 1,
  },
});

const reviewPhotosUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_MB * 1024 * 1024, files: MAX_REVIEW_PHOTOS },
});

module.exports = { productImagesUpload, adminProductUpload, reviewPhotosUpload, UPLOAD_DIR };
