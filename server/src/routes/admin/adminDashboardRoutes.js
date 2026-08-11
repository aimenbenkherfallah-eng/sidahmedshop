const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { getDashboardStats } = require('../../controllers/adminOrderController');

router.get('/stats', protect, adminOnly, getDashboardStats);

module.exports = router;
