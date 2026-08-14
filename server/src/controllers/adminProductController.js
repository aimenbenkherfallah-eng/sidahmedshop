const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { reviewSchema } = require('../validators/schemas');
const { uploadBuffer, deleteImage } = require('../services/cloudinaryService');

const getAdminProducts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, includeInactive } = req.query;
    const filter = {};
    if (includeInactive !== 'true') filter.active = true;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { titleAr: rx }, { category: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-reviews')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
};

const getAdminProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const parseImageUrls = (raw) =>
  String(raw || '')
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);

const deleteLocalUpload = (url) => {
  if (!url?.startsWith('/uploads/')) return;
  const filename = url.replace(/^\/uploads\//, '');
  if (!/^[a-zA-Z0-9-]+\.(jpe?g|png|webp|gif|avif)$/.test(filename)) return;
  fs.unlink(path.join(__dirname, '..', '..', 'uploads', filename), () => {});
};

const deleteStoredImage = async (url) => {
  deleteLocalUpload(url);
  await deleteImage(url);
};

const uploadFiles = async (files, folder, createdAssets) => {
  const uploaded = [];
  for (const file of files) {
    const asset = await uploadBuffer(file.buffer, folder);
    uploaded.push(asset);
    createdAssets.push(asset);
  }
  return uploaded;
};

const cleanupAssets = async (operations, context) => {
  const results = await Promise.allSettled(operations);
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) {
    console.error(`[Cloudinary] ${failed.length} cleanup operation(s) failed during ${context}.`);
  }
};

const createProduct = async (req, res, next) => {
  const createdAssets = [];
  try {
    const all = req.files || {};
    const files = all.images || [];
    const uploaded = await uploadFiles(files, 'sidahmed-shop/products', createdAssets);
    const urls = parseImageUrls(req.body.imageUrls);
    const images = uploaded.length ? uploaded.map((asset) => asset.url) : urls;

    const landingFile = all.landingImage?.[0];
    let landingImage = (req.body.landingImageUrl || '').trim();
    if (landingFile) {
      const [asset] = await uploadFiles([landingFile], 'sidahmed-shop/landing-pages', createdAssets);
      landingImage = asset.url;
    }

    const product = await Product.create({
      title: req.body.title,
      titleAr: req.body.titleAr,
      description: req.body.description,
      descriptionAr: req.body.descriptionAr,
      category: req.body.category,
      price: req.body.price,
      discountedPrice: req.body.discountedPrice || null,
      stock: req.body.stock,
      active: req.body.active !== false,
      images,
      landingPage: {
        enabled: req.body.landingEnabled !== false,
        image: landingImage,
        html: req.body.landingHtml || '',
      },
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    await cleanupAssets(createdAssets.map((asset) => deleteImage(asset.url)), 'product creation rollback');
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  const createdAssets = [];
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    const previousImages = [...(product.images || [])];
    const previousLandingImage = product.landingPage?.image || '';

    const all = req.files || {};
    const files = all.images || [];
    const uploaded = await uploadFiles(files, 'sidahmed-shop/products', createdAssets);
    const urls = parseImageUrls(req.body.imageUrls);

    let images = product.images;
    if (uploaded.length) images = uploaded.map((asset) => asset.url);
    else images = urls;

    const landingFile = all.landingImage?.[0];
    let landingImage = product.landingPage?.image || '';
    if (landingFile) {
      const [asset] = await uploadFiles([landingFile], 'sidahmed-shop/landing-pages', createdAssets);
      landingImage = asset.url;
    } else landingImage = (req.body.landingImageUrl || '').trim();

    const { title, titleAr, description, descriptionAr, category, price, discountedPrice, stock, active } = req.body;

    product.title = title;
    product.titleAr = titleAr || '';
    product.description = description || '';
    product.descriptionAr = descriptionAr || '';
    product.category = category;
    product.price = price;
    product.discountedPrice = discountedPrice != null && discountedPrice !== '' ? discountedPrice : null;
    product.stock = stock;
    product.active = active !== false;
    product.images = images;
    product.landingPage = {
      enabled: req.body.landingEnabled !== false,
      image: landingImage,
      html: req.body.landingHtml || '',
    };

    await product.save();

    const removedImages = previousImages.filter((image) => !images.includes(image));
    await cleanupAssets(removedImages.map(deleteStoredImage), 'product image replacement');
    if (previousLandingImage && previousLandingImage !== landingImage) {
      await cleanupAssets([deleteStoredImage(previousLandingImage)], 'landing image replacement');
    }
    res.json({ success: true, product });
  } catch (err) {
    await cleanupAssets(createdAssets.map((asset) => deleteImage(asset.url)), 'product update rollback');
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    await product.deleteOne();
    const reviewPhotos = (product.reviews || []).flatMap((review) => review.photos || []);
    await cleanupAssets([
      ...(product.images || []).map(deleteStoredImage),
      deleteStoredImage(product.landingPage?.image),
      ...reviewPhotos.map(deleteStoredImage),
    ], 'product deletion');
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  const createdAssets = [];
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0]?.message || 'Invalid review.', 422));
    }

    const files = req.files || [];
    const uploaded = await uploadFiles(files, 'sidahmed-shop/reviews', createdAssets);
    const photos = uploaded.map((asset) => asset.url);

    product.reviews.push({ ...parsed.data, photos });
    await product.save();

    res.status(201).json({
      success: true,
      product: {
        rating: product.rating,
        numReviews: product.numReviews,
        reviews: product.reviews,
      },
    });
  } catch (err) {
    await cleanupAssets(createdAssets.map((asset) => deleteImage(asset.url)), 'review creation rollback');
    next(err);
  }
};

module.exports = {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};
