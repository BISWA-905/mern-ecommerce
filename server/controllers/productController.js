const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// The only fields an admin is allowed to set on a product
const allowedFields = [
  'name',
  'description',
  'price',
  'images',
  'category',
  'stock',
  'isFeatured',
];

// GET ALL products, with search, filter and sort
// GET /api/products?search=shoe&category=<id>&sort=price_asc&featured=true&limit=8
const getProducts = async (req, res) => {
  try {
    const { search, category, sort, featured, limit } = req.query;
    const filter = {};

    // Search by name (case-insensitive)
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: safeSearch, $options: 'i' };
    }

    // Filter by category
    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.status(400).json({ message: 'Invalid category id' });
      }
      filter.category = category;
    }

    // Only featured products (for the homepage)
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Sorting
    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    let query = Product.find(filter)
      .populate('category', 'name')
      .sort(sortBy);

    if (limit && Number(limit) > 0) {
      query = query.limit(Number(limit));
    }

    const products = await query;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE product, with its reviews
// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findById(id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ ...product.toObject(), reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a product (admin only)
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const data = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    if (!mongoose.isValidObjectId(data.category)) {
      return res.status(400).json({ message: 'A valid category is required' });
    }

    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Category does not exist' });
    }

    const product = await Product.create(data);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a product (admin only)
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.body.category !== undefined) {
      if (!mongoose.isValidObjectId(req.body.category)) {
        return res.status(400).json({ message: 'Invalid category id' });
      }
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Category does not exist' });
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// DELETE a product (admin only)
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove the reviews that belonged to this product
    await Review.deleteMany({ product: id });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};