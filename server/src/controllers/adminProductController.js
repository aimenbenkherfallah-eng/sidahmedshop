const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { reviewSchema } = require('../validators/schemas');

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

const createProduct = async (req, res, next) => {
  try {
    const files = req.files || [];
    const uploaded = files.map((f) => `/uploads/${f.filename}`);
    const urls = parseImageUrls(req.body.imageUrls);
    const images = uploaded.length ? uploaded : urls;

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
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    const files = req.files || [];
    const uploaded = files.map((f) => `/uploads/${f.filename}`);
    const urls = parseImageUrls(req.body.imageUrls);

    let images = product.images;
    if (uploaded.length) images = uploaded;
    else if (urls.length) images = urls;

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

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    for (const img of product.images || []) {
      if (img.startsWith('/uploads/')) {
        const filename = img.replace(/^\/uploads\//, '');
        const full = path.join(__dirname, '..', '..', 'uploads', filename);
        fs.unlink(full, () => {});
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new AppError('Product not found.', 404));

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0]?.message || 'Invalid review.', 422));
    }

    const files = req.files || [];
    const photos = files.map((f) => `/uploads/${f.filename}`);

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
