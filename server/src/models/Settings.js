const mongoose = require('mongoose');
const { PROVINCE_CODES } = require('../config/constants');

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      ar: { type: String, default: 'متجر سيد أحمد', maxlength: 80 },
      fr: { type: String, default: 'Sidahmed Shop', maxlength: 80 },
    },
    announcement: {
      enabled: { type: Boolean, default: true },
      ar: {
        type: String,
        default: 'الدفع عند الاستلام والتوصيل إلى جميع الولايات 🚚',
        maxlength: 200,
      },
      fr: {
        type: String,
        default: 'Paiement à la livraison et livraison dans toutes les wilayas 🚚',
        maxlength: 200,
      },
    },
    hero: {
      titleAr: { type: String, default: 'تسوق بثقة، ادفع عند الاستلام', maxlength: 200 },
      titleFr: { type: String, default: 'Shop with confidence, pay on delivery', maxlength: 200 },
      subtitleAr: { type: String, default: 'منتجات أصلية بأسعار تنافسية مع التوصيل إلى جميع الولايات', maxlength: 300 },
      subtitleFr: { type: String, default: 'Genuine products at competitive prices with nationwide delivery', maxlength: 300 },
    },
    metaPixelId: { type: String, default: '', maxlength: 64, trim: true },
    tiktokPixelId: { type: String, default: '', maxlength: 64, trim: true },
    landingPage: {
      enabled: { type: Boolean, default: true },
    },
    defaultShippingFee: { type: Number, default: 600, min: 0, max: 50000 },
    shippingFees: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true, versionKey: false, strict: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
