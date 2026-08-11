const router = require('express').Router();
const { login, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { adminLoginLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { adminLoginSchema } = require('../validators/schemas');

router.post('/admin/login', adminLoginLimiter, validate(adminLoginSchema), login);
router.post('/admin/logout', logout);
router.get('/admin/me', protect, me);

module.exports = router;
