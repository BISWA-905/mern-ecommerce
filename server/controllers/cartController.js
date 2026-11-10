const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Build the cart the website will show: items, subtotals and the total
const buildCartResponse = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate(
    'items.product',
    'name price images stock'
  );

  if (!cart) {
    return { items: [], totalPrice: 0 };
  }

  // Skip any product that was deleted from the shop
  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);

  return { items, totalPrice };
};

// Check that a quantity is a whole number of at least 1
const parseQuantity = (value) => {
  const quantity = Number(value === undefined ? 1 : value);
  return Number.isInteger(quantity) && quantity >= 1 ? quantity : null;
};

// VIEW my cart
// GET /api/cart
const getCart = async (req, res) => {
  try {
    res.json(await buildCartResponse(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD a product to my cart
// POST /api/cart   body: { productId, quantity }
const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'A valid productId is required' });
    }
    if (quantity === null) {
      return res
        .status(400)
        .json({ message: 'Quantity must be a whole number, 1 or more' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      (item) => item.product.toString() === productId
    );
    const newQuantity = (existing ? existing.quantity : 0) + quantity;

    if (newQuantity > product.stock) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} left in stock` });
    }

    if (existing) {
      existing.quantity = newQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(201).json(await buildCartResponse(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE the quantity of one item (increase or decrease)
// PUT /api/cart/:productId   body: { quantity }
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = parseQuantity(req.body.quantity);

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    if (quantity === null) {
      return res.status(400).json({
        message: 'Quantity must be a whole number, 1 or more. To remove an item, use delete.',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart
      ? cart.items.find((i) => i.product.toString() === productId)
      : null;

    if (!item) {
      return res.status(404).json({ message: 'Item is not in your cart' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product no longer exists' });
    }
    if (quantity > product.stock) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} left in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(await buildCartResponse(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE one product from my cart
// DELETE /api/cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      await cart.save();
    }

    res.json(await buildCartResponse(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EMPTY my whole cart
// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ items: [], totalPrice: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};