const mongoose = require('mongoose');
const User = require('../models/User');
const Cart = require('../models/Cart');

// SEE all users (admin only)
// GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE a user's role (admin only)
// PUT /api/users/:id/role   body: { role: "user" or "admin" }
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user or admin' });
    }
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE a user (admin only)
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove their cart. Their past orders are kept for the shop's records.
    await Cart.findOneAndDelete({ user: id });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };