const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addressFields = [
  'fullName',
  'phone',
  'address',
  'city',
  'state',
  'postalCode',
];
const validStatuses = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// PLACE an order from my cart
// POST /api/orders   body: { shippingAddress: { ... } }
const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const missing = addressFields.filter(
      (field) => !shippingAddress[field] || !String(shippingAddress[field]).trim()
    );
    if (missing.length > 0) {
      return res
        .status(400)
        .json({ message: `Missing shipping details: ${missing.join(', ')}` });
    }

    // Keep only the address fields we expect
    const address = {};
    [...addressFields, 'country'].forEach((field) => {
      if (shippingAddress[field]) {
        address[field] = String(shippingAddress[field]).trim();
      }
    });

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Build the order from the REAL product data, never from the website
    const orderItems = [];
    let totalPrice = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          message: 'A product in your cart is no longer available. Please remove it.',
        });
      }
      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `${product.name}: only ${product.stock} left in stock`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        quantity: item.quantity,
      });
      totalPrice += product.price * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: address,
      totalPrice,
    });

    // Take the bought items out of the stock
    await Product.bulkWrite(
      orderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      }))
    );

    // Empty the cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json(order);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// SEE my own orders
// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEE one order (its owner or an admin only)
// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'This is not your order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEE all orders (admin only)
// GET /api/orders?status=Pending
const getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && validStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE an order's status (admin only)
// PUT /api/orders/:id/status   body: { status }
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Cancelled' && status !== 'Cancelled') {
      return res
        .status(400)
        .json({ message: 'A cancelled order cannot be reopened' });
    }

    // If the order is being cancelled, put the items back in stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await Product.bulkWrite(
        order.orderItems.map((item) => ({
          updateOne: {
            filter: { _id: item.product },
            update: { $inc: { stock: item.quantity } },
          },
        }))
      );
    }

    order.status = status;
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};