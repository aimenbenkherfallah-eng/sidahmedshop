const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    comment: { type: String, required: [true, 'Comment is required'], trim: true, maxlength: 1000 },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 4,
        message: 'Maximum 4 photos per review',
      },
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title (FR/EN) is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    titleAr: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 5000, default: '' },
    descriptionAr: { type: String, trim: true, maxlength: 5000, default: '' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: 80,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price must be positive'],
      default: null,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 6,
        message: 'Maximum 6 images per product',
      },
    },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    active: { type: Boolean, default: true, index: true },
    slug: { type: String, unique: true, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
  },
  { timestamps: true, versionKey: false, strict: true }
);

productSchema.pre('validate', function preValidate() {
  if (!this.slug && this.title) {
    const base = this.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 80);
    this.slug = `${base || 'produit'}-${Date.now().toString(36)}`;
  }
});

productSchema.pre('save', function recalcRating(next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  } else {
    this.rating = 0;
    this.numReviews = 0;
  }
  next();
});

productSchema.methods.effectivePrice = function effectivePrice() {
  return this.discountedPrice != null && this.discountedPrice < this.price
    ? this.discountedPrice
    : this.price;
};

module.exports = mongoose.model('Product', productSchema);
