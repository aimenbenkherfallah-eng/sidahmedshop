const router = require('express').Router();
const { getPublicSettings } = require('../controllers/settingsController');

router.get('/public', getPublicSettings);

module.exports = router;
