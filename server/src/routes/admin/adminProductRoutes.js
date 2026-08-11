const router = require('express').Router();
const { protect, adminOnly } = require('../../middleware/auth');
const { validate } = require('../../middleware/validate');
const { productImagesUpload } = require('../../middleware/upload');
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
router.post('/', productImagesUpload.array('images', 6), validate(adminProductSchema), createProduct);
router.put('/:id', productImagesUpload.array('images', 6), validate(adminProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
