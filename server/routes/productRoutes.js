const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Anyone can browse products
router.get('/', getProducts);
router.get('/:id', getProductById);

// Any logged-in customer can review a product they ordered
router.post('/:id/reviews', protect, createProductReview);

// Only a logged-in admin can add, change or remove products
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;