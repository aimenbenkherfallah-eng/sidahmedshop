const router = require('express').Router();
const { createOrder } = require('../controllers/orderController');
const { orderCreationLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { orderSchema } = require('../validators/schemas');

router.post('/', orderCreationLimiter, validate(orderSchema), createOrder);

module.exports = router;
