const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { getSettings, updateSettings } = require('../../controllers/adminSettingsController');

router.use(protect, adminOnly);

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;
