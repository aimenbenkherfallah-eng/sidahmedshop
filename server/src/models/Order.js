const mongoose = require('mongoose');
const { ORDER_STATUSES } = require('../config/constants');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    nameAr: { type: String, trim: true, maxlength: 200, default: '' },
    quantity: { type: Number, required: true, min: 1, max: 99 },
    unitPrice: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
  },
  { _id: false, versionKey: false, strict: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customerName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(\+?213|0)?[5-7]\d{8}$/, 'Please provide a valid Algerian phone number'],
      index: true,
    },
    wilaya: { type: Number, required: [true, 'Province is required'], min: 1, max: 58, index: true },
    wilayaName: { type: String, required: true, trim: true, maxlength: 100 },
    address: { type: String, trim: true, maxlength: 500, default: '' },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 20,
        message: 'An order must contain between 1 and 20 items',
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    source: { type: String, enum: ['express', 'checkout'], default: 'checkout' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    eventId: { type: String, default: '', index: true },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false, strict: true }
);

orderSchema.pre('validate', function preValidate() {
  if (!this.orderNumber) {
    this.orderNumber = `SA-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 900 + 100
    )}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
