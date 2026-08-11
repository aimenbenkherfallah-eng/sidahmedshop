const Product = require('../models/Product');
const AppError = require('../utils/AppError');

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      minRating,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { active: true };
    if (category) filter.category = category;

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { titleAr: rx }, { description: rx }, { descriptionAr: rx }, { category: rx }];
    }

    if (minPrice || maxPrice) {
      const priceFilter = [];
      if (minPrice) {
        priceFilter.push({ price: { $gte: Number(minPrice) } });
        priceFilter.push({ discountedPrice: { $gte: Number(minPrice) } });
      }
      if (maxPrice) {
        priceFilter.push({ price: { $lte: Number(maxPrice) } });
        priceFilter.push({ discountedPrice: { $lte: Number(maxPrice) } });
      }
      if (priceFilter.length) filter.$or = [...(filter.$or || []), ...priceFilter];
    }

    if (minRating) filter.rating = { $gte: Number(minRating) };

    const sortMap = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1, numReviews: -1 },
      'discount-desc': { discountedPrice: 1 },
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(60, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('-reviews')
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
    if (!product) return next(new AppError('Product not found.', 404));
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const products = await Product.find({ active: true, discountedPrice: { $ne: null } })
      .select('-reviews')
      .sort({ numReviews: -1, createdAt: -1 })
      .limit(8)
      .lean();
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductBySlug, getCategories, getTrending };
