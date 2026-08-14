const cloudinary = require('cloudinary').v2;

const configured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const ensureConfigured = () => {
  if (!configured()) {
    const error = new Error('Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const uploadBuffer = (buffer, folder = 'sidahmed-shop') => new Promise((resolve, reject) => {
  ensureConfigured();
  const upload = cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type: 'image',
      overwrite: false,
      unique_filename: true,
    },
    (error, result) => (error ? reject(error) : resolve({ url: result.secure_url, publicId: result.public_id }))
  );
  upload.end(buffer);
});

const extractPublicId = (value) => {
  if (!value || !value.includes('res.cloudinary.com')) return null;
  try {
    const parsed = new URL(value);
    const expectedHost = `res.cloudinary.com`;
    if (parsed.hostname !== expectedHost) return null;
    const marker = '/upload/';
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return null;
    const segments = parsed.pathname.slice(index + marker.length).split('/').filter(Boolean);
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicSegments = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;
    if (!publicSegments.length) return null;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName || !parsed.pathname.startsWith(`/${cloudName}/`)) return null;
    publicSegments[publicSegments.length - 1] = publicSegments.at(-1).replace(/\.[a-z0-9]+$/i, '');
    const publicId = decodeURIComponent(publicSegments.join('/'));
    return publicId.startsWith('sidahmed-shop/') ? publicId : null;
  } catch {
    return null;
  }
};

const deleteImage = async (value) => {
  const publicId = extractPublicId(value);
  if (!publicId || !configured()) return;
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
};

module.exports = { configured, uploadBuffer, deleteImage, extractPublicId };
