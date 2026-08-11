const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { getOrders, getOrder, updateOrderStatus } = require('../../controllers/adminOrderController');

router.use(protect, adminOnly);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
