const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { MAX_IMAGE_SIZE_MB, MAX_LANDING_IMAGE_SIZE_MB, MAX_IMAGES_PER_PRODUCT, MAX_REVIEW_PHOTOS } = require('../config/constants');
const AppError = require('../utils/AppError');

const IMAGE_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = IMAGE_EXTENSIONS[file.mimetype];
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!IMAGE_EXTENSIONS[file.mimetype]) {
    return cb(new AppError('Only JPEG, PNG, WebP, GIF or AVIF images are allowed.', 400));
  }
  cb(null, true);
};

const hasValidSignature = (file) => {
  const bytes = fs.readFileSync(file.path).subarray(0, 16);
  if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === 'image/gif') return bytes.subarray(0, 6).toString('ascii') === 'GIF87a' || bytes.subarray(0, 6).toString('ascii') === 'GIF89a';
  if (file.mimetype === 'image/webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (file.mimetype === 'image/avif') return bytes.subarray(4, 12).toString('ascii').includes('ftypavif');
  return false;
};

const validateUploadedImages = (req, _res, next) => {
  const files = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files || {}).flat();
  const invalid = files.find((file) => !hasValidSignature(file));
  if (!invalid) return next();

  for (const file of files) {
    if (file?.path) fs.unlink(file.path, () => {});
  }
  req.files = {};
  return next(new AppError('Invalid or corrupted image file.', 400));
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

module.exports = {
  productImagesUpload,
  adminProductUpload,
  reviewPhotosUpload,
  validateUploadedImages,
  UPLOAD_DIR,
};
