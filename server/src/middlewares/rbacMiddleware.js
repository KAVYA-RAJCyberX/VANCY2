const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Strictly verify the short-lived access token
const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // We only allow these roles in the admin panel
      if (['support-staff', 'manager', 'super-admin'].includes(decoded.role)) {
        req.user = await User.findById(decoded.userId).select('-password');
        if (req.user && req.user.role === decoded.role) {
          next();
        } else {
          res.status(401).json({ message: 'Role mismatch or user not found' });
        }
      } else {
        res.status(403).json({ message: 'Not authorized for admin access' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Access token expired or invalid' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no access token' });
  }
};

// Check if user has one of the required roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
    }
  };
};

module.exports = { protectAdmin, requireRole };
