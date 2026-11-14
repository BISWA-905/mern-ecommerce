const express = require('express');
const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Every door here needs a logged-in admin
router.use(protect, admin);

router.get('/', getUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;