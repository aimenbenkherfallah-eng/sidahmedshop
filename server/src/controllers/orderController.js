const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const { generateEventId } = require('../utils/hash');
const { verifyTurnstile } = require('../services/turnstileService');
const { sendMetaEvent } = require('../services/metaService');
const { sendTikTokEvent } = require('../services/tiktokService');

const THROTTLE_WINDOW_MS = 10 * 60 * 1000;

const createOrder = async (req, res, next) => {
  try {
    const { customerName, phone, wilaya, address, items, source, notes, captchaToken } = req.body;
    const ipAddress = req.ip || req.socket?.remoteAddress || '';

    const captcha = await verifyTurnstile(captchaToken, ipAddress);
    if (!captcha.success) {
      return next(new AppError('Robot verification failed. Please try again.', 400));
    }

    const throttleCutoff = new Date(Date.now() - THROTTLE_WINDOW_MS);
    const recentOrder = await Order.findOne({
      createdAt: { $gte: throttleCutoff },
      $or: [{ phone }, { ipAddress }],
    }).lean();
    if (recentOrder) {
      return next(
        new AppError('An order was already placed from this phone/device recently. We will contact you to confirm it.', 429)
      );
    }

    const ids = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids }, active: true });
    if (products.length !== ids.length) {
      return next(new AppError('One or more products are no longer available.', 400));
    }

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const unitPrice = product.effectivePrice();
      const qty = item.quantity;
      if (product.stock < qty) {
        return next(
          new AppError(`"${product.title}" has only ${product.stock} item(s) left in stock.`, 400)
        );
      }
      orderItems.push({
        productId: product._id,
        name: product.title,
        nameAr: product.titleAr || product.title,
        quantity: qty,
        unitPrice,
        image: product.images?.[0] || '',
      });
      subtotal += unitPrice * qty;
    }

    const settings = await Settings.getSingleton();
    const feeMap = settings.shippingFees || new Map();
    const shippingFee = feeMap.get(String(wilaya)) ?? settings.defaultShippingFee ?? 0;
    const total = subtotal + shippingFee;

    const eventId = generateEventId();

    const order = await Order.create({
      customerName,
      phone,
      wilaya,
      address,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      source,
      notes,
      eventId,
      ipAddress,
    });

    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';

    sendMetaEvent({
      eventName: 'Purchase',
      eventId,
      phone,
      ip: ipAddress,
      userAgent,
      url: referer,
      customData: {
        value: total,
        currency: 'DZD',
        content_ids: orderItems.map((i) => String(i.productId)),
        num_items: orderItems.reduce((s, i) => s + i.quantity, 0),
      },
    });

    sendTikTokEvent({
      eventId,
      eventName: 'PlaceAnOrder',
      phone,
      ip: ipAddress,
      userAgent,
      url: referer,
      properties: {
        value: total,
        currency: 'DZD',
        content_type: 'product',
        content_id: orderItems.map((i) => String(i.productId)),
        quantity: orderItems.reduce((s, i) => s + i.quantity, 0),
      },
    });

    res.status(201).json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        eventId,
        total,
        shippingFee,
        subtotal,
        customerName,
        phone,
        wilaya,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder };
