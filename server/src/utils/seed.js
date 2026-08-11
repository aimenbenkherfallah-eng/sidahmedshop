require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Product = require('../models/Product');

const SALT_ROUNDS = 10;

const sampleProducts = [
  {
    title: 'Smart Watch Series X - Connectée',
    titleAr: 'ساعة ذكية Series X',
    description:
      'Smartwatch with AMOLED display, heart-rate monitor, GPS and 7-day battery life. Compatible with Android & iOS.',
    descriptionAr: 'ساعة ذكية بشاشة AMOLED، قياس نبضات القلب، نظام تحديد المواقع GPS وبطارية تدوم 7 أيام.',
    category: 'Électronique',
    price: 12000,
    discountedPrice: 8900,
    stock: 40,
    images: ['https://picsum.photos/seed/swx1/900/900', 'https://picsum.photos/seed/swx2/900/900'],
  },
  {
    title: 'Casque Bluetooth Sans Fil',
    titleAr: 'سماعات بلوتوث لاسلكية',
    description: 'Wireless over-ear headphones with active noise cancellation and 30h playback.',
    descriptionAr: 'سماعات رأس لاسلكية مع خاصية إلغاء الضوضاء وبطارية تدوم 30 ساعة.',
    category: 'Électronique',
    price: 7500,
    discountedPrice: 5400,
    stock: 35,
    images: ['https://picsum.photos/seed/hp1/900/900', 'https://picsum.photos/seed/hp2/900/900'],
  },
  {
    title: 'Veste en Cuir Premium',
    titleAr: 'سترة جلدية فاخرة',
    description: 'Premium leather jacket, winter collection, available in multiple sizes.',
    descriptionAr: 'سترة جلدية فاخرة لموسم الشتاء، متوفرة بعدة مقاسات.',
    category: 'Mode',
    price: 15000,
    discountedPrice: 11900,
    stock: 20,
    images: ['https://picsum.photos/seed/jkt1/900/900', 'https://picsum.photos/seed/jkt2/900/900'],
  },
  {
    title: 'Machine à Café Expresso',
    titleAr: 'آلة قهوة إسبريسو',
    description: '15-bar espresso machine with milk frother, 1.5L water tank.',
    descriptionAr: 'آلة قهوة إسبريسو بقوة 15 بار مع مبخرة حليب وخزان ماء سعة 1.5 لتر.',
    category: 'Maison',
    price: 28000,
    discountedPrice: 21900,
    stock: 12,
    images: ['https://picsum.photos/seed/cfe1/900/900'],
  },
  {
    title: 'Perceuse Visseuse Sans Fil',
    titleAr: 'مثقاب لاسلكي',
    description: 'Cordless drill 20V with 2 batteries, LED light, variable speed.',
    descriptionAr: 'مثقاب لاسلكي 20 فولط مع بطاريتين وإضاءة LED وسرعة متغيرة.',
    category: 'Maison',
    price: 9800,
    discountedPrice: 7600,
    stock: 25,
    images: ['https://picsum.photos/seed/drl1/900/900'],
  },
  {
    title: 'Sac à Main Femme Élégant',
    titleAr: 'حقيبة يد نسائية أنيقة',
    description: 'Elegant women handbag, PU leather, spacious compartments.',
    descriptionAr: 'حقيبة يد نسائية أنيقة من الجلد الصناعي مع عدة جيوب داخلية.',
    category: 'Mode',
    price: 6500,
    discountedPrice: 4900,
    stock: 30,
    images: ['https://picsum.photos/seed/bag1/900/900', 'https://picsum.photos/seed/bag2/900/900'],
  },
  {
    title: 'Crème Visage Hydratante',
    titleAr: 'كريم مرطب للوجه',
    description: 'Hydrating face cream with hyaluronic acid and vitamin E, 50ml.',
    descriptionAr: 'كريم مرطب للوجه بحمض الهيالورونيك وفيتامين E، 50 مل.',
    category: 'Beauté',
    price: 3200,
    discountedPrice: 2400,
    stock: 60,
    images: ['https://picsum.photos/seed/crm1/900/900'],
  },
  {
    title: 'Tapis de Sport Yoga',
    titleAr: 'سجادة يوجا رياضية',
    description: 'Non-slip yoga mat, 6mm thickness, includes carrying strap.',
    descriptionAr: 'سجادة يوجا مانعة للانزلاق بسماكة 6 مم مع حزام حمل.',
    category: 'Sport',
    price: 2800,
    discountedPrice: 1990,
    stock: 45,
    images: ['https://picsum.photos/seed/yog1/900/900'],
  },
  {
    title: 'Chargeur Sans Fil Rapide',
    titleAr: 'شاحن لاسلكي سريع',
    description: '15W wireless fast charger, compatible with all Qi devices.',
    descriptionAr: 'شاحن لاسلكي سريع بقوة 15 واط متوافق مع جميع أجهزة Qi.',
    category: 'Électronique',
    price: 2200,
    discountedPrice: 1500,
    stock: 80,
    images: ['https://picsum.photos/seed/wch1/900/900'],
  },
  {
    title: 'Ensemble Couverture Polaire',
    titleAr: 'طقم غطاء صوفي',
    description: 'Soft fleece blanket set 200x230cm, winter warmth.',
    descriptionAr: 'غطاء صوفي ناعم مقاس 200x230 سم دافئ للشتاء.',
    category: 'Maison',
    price: 4800,
    discountedPrice: 3600,
    stock: 28,
    images: ['https://picsum.photos/seed/bln1/900/900'],
  },
];

const seedAdmin = async () => {
  const username = (process.env.ADMIN_USERNAME || 'sidahmed').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'slhgta62004';

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`[Seed] Admin user "${username}" already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await User.create({ username, passwordHash, role: 'admin' });
  console.log(`[Seed] Admin user created: "${username}" (bcrypt salt rounds: ${SALT_ROUNDS})`);
};

const seedSettings = async () => {
  let settings = await Settings.findOne();
  if (settings) {
    console.log('[Seed] Settings already exist.');
    return;
  }

  settings = await Settings.create({
    storeName: { ar: 'متجر سيد أحمد', fr: 'Sidahmed Shop' },
    announcement: {
      enabled: true,
      ar: 'الدفع عند الاستلام والتوصيل إلى جميع الولايات 🚚',
      fr: 'Paiement à la livraison et livraison dans toutes les wilayas 🚚',
    },
    defaultShippingFee: 600,
    shippingFees: { '16': 400, '31': 500, '9': 500 },
  });
  console.log('[Seed] Settings created.');
};

const seedProducts = async () => {
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`[Seed] ${count} products already exist. Skipping sample products.`);
    return;
  }

  await Product.insertMany(sampleProducts);
  console.log(`[Seed] ${sampleProducts.length} sample products created.`);
};

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedSettings();
    await seedProducts();
    console.log('[Seed] Done.');
  } catch (err) {
    console.error('[Seed] Failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
