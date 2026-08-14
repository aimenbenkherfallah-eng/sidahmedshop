const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { adminProductUpload, validateUploadedImages } = require('../../middleware/upload');
const { adminProductSchema } = require('../../validators/schemas');
const {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../../controllers/adminProductController');

router.use(protect, adminOnly);

router.get('/', getAdminProducts);
router.get('/:id', getAdminProduct);
router.post(
  '/',
  adminProductUpload.fields([
    { name: 'images', maxCount: 6 },
    { name: 'landingImage', maxCount: 1 },
  ]),
  validateUploadedImages,
  validate(adminProductSchema),
  createProduct
);
router.put(
  '/:id',
  adminProductUpload.fields([
    { name: 'images', maxCount: 6 },
    { name: 'landingImage', maxCount: 1 },
  ]),
  validateUploadedImages,
  validate(adminProductSchema),
  updateProduct
);
router.delete('/:id', deleteProduct);

module.exports = router;
