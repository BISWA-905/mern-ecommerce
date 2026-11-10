const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Guard 1: is the person logged in?
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not logged in. No token.' });
    }

    const token = authHeader.split(' ')[1];

    // Check the wristband is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user, but leave out the password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Remember who this is for the next steps
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Guard 2: is the person the shop owner?
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};

module.exports = { protect, admin };