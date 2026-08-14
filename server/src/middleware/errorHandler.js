const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

const fs = require('fs');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier.';
  }

  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `Duplicate value for "${field}".`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Image trop lourde. Taille maximale : 12 Mo par fichier.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Trop de fichiers envoyés (max 7 : 6 images + 1 landing).';
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  if (!err.isOperational) {
    console.error('[ERROR]', err);
  }

  const uploadedFiles = Array.isArray(req.files)
    ? req.files
    : Object.values(req.files || {}).flat();
  for (const file of uploadedFiles) {
    if (file?.path) fs.unlink(file.path, () => {});
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};

module.exports = { notFound, errorHandler };
