const router = require('express').Router();
const { getProducts, getProductBySlug, getCategories, getTrending } = require('../controllers/productController');
const { addReview } = require('../controllers/adminProductController');
const { reviewLimiter } = require('../middleware/rateLimiter');
const { reviewPhotosUpload } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/trending', getTrending);
router.get('/:slug', getProductBySlug);
router.post('/:id/reviews', reviewLimiter, reviewPhotosUpload.array('photos', 4), addReview);

module.exports = router;
