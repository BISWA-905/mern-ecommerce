const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Every order door needs a logged-in user
router.use(protect);

// Customer doors
router.post('/', createOrder);
router.get('/my', getMyOrders);

// Admin doors
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

// One order (the controller checks it is yours, or that you are an admin)
router.get('/:id', getOrderById);

module.exports = router;