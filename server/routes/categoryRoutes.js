const express = require('express');
const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Anyone can see the categories
router.get('/', getCategories);

// Only a logged-in admin can add a category
router.post('/', protect, admin, createCategory);

module.exports = router;