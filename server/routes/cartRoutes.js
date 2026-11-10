const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Every cart door needs a logged-in user
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', clearCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);

module.exports = router;