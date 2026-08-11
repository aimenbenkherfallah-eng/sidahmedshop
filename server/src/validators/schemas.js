const { z } = require('zod');
const { PROVINCE_CODES } = require('../config/constants');

const orderItemSchema = z.object({
  productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product id'),
  quantity: z.number().int().min(1).max(99),
});

const orderSchema = z.object({
  customerName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(100),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^(\+?213|0)?[5-7]\d{8}$/, 'Please provide a valid Algerian phone number (e.g. 0550123456)'),
  wilaya: z
    .number({ required_error: 'Province is required' })
    .int()
    .refine((v) => PROVINCE_CODES.includes(v), 'Invalid province code'),
  address: z.string().trim().max(500).optional().default(''),
  items: z
    .array(orderItemSchema, { required_error: 'Cart is empty' })
    .min(1, 'Cart is empty')
    .max(20, 'Too many items'),
  source: z.enum(['express', 'checkout']).default('checkout'),
  notes: z.string().trim().max(500).optional().default(''),
  captchaToken: z.preprocess(
    (v) => (typeof v === 'string' ? v : ''),
    z.string().max(4096).default('')
  ),
});

const reviewSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, 'Comment must be at least 5 characters').max(1000),
});

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(64),
  password: z.string().min(1, 'Password is required').max(128),
});

const adminProductSchema = z.object({
  title: z.string().trim().min(2, 'Title is required').max(200),
  titleAr: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(5000).optional().default(''),
  descriptionAr: z.string().trim().max(5000).optional().default(''),
  category: z.string().trim().min(2, 'Category is required').max(80),
  price: z.coerce.number().min(0, 'Price must be positive').max(1e9),
  discountedPrice: z.preprocess(
    (v) => (v === '' || v == null ? null : Number(v)),
    z.number().min(0).max(1e9).nullable()
  ),
  stock: z.coerce.number().int().min(0).max(1e6),
  active: z.coerce.boolean().optional().default(true),
  imageUrls: z.string().optional().default(''),
});

const adminSettingsSchema = z.object({
  storeName: z.object({ ar: z.string().max(80), fr: z.string().max(80) }).optional(),
  announcement: z
    .object({
      enabled: z.boolean().optional(),
      ar: z.string().max(200).optional(),
      fr: z.string().max(200).optional(),
    })
    .optional(),
  hero: z
    .object({
      titleAr: z.string().max(200).optional(),
      titleFr: z.string().max(200).optional(),
      subtitleAr: z.string().max(300).optional(),
      subtitleFr: z.string().max(300).optional(),
    })
    .optional(),
  metaPixelId: z.string().max(64).trim().optional(),
  tiktokPixelId: z.string().max(64).trim().optional(),
  defaultShippingFee: z.coerce.number().min(0).max(50000).optional(),
  shippingFees: z.record(z.coerce.number().min(0).max(50000)).optional(),
});

module.exports = {
  orderSchema,
  reviewSchema,
  adminLoginSchema,
  adminProductSchema,
  adminSettingsSchema,
};
