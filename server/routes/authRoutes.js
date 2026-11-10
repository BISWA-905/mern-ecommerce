const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Anyone can register or log in
router.post('/register', registerUser);
router.post('/login', loginUser);

// Only logged-in users can see their own profile
router.get('/profile', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;