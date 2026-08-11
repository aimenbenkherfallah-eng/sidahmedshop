const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { ORDER_STATUSES } = require('../config/constants');

const getOrders = async (req, res, next) => {
  try {
    const { status, wilaya, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && ORDER_STATUSES.includes(status)) filter.status = status;
    if (wilaya && Number(wilaya) >= 1 && Number(wilaya) <= 58) filter.wilaya = Number(wilaya);

    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ customerName: rx }, { phone: rx }, { orderNumber: rx }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return next(new AppError('Order not found.', 404));
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return next(new AppError('Invalid order status.', 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found.', 404));

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: item.quantity } },
        },
      }));
      if (bulkOps.length) await Product.bulkWrite(bulkOps);
    }

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalOrders, pendingOrders, deliveredOrders, cancelledOrders, revenueAgg, recentOrders, lowStock] =
      await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'delivered' }),
        Order.countDocuments({ status: 'cancelled' }),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, revenue: { $sum: '$total' } } },
        ]),
        Order.find().sort({ createdAt: -1 }).limit(5).lean(),
        Product.find({ stock: { $lte: 5 }, active: true }).select('title stock price').sort({ stock: 1 }).limit(5).lean(),
      ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        revenue: revenueAgg[0]?.revenue || 0,
        lowStock,
      },
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrder, updateOrderStatus, getDashboardStats };
