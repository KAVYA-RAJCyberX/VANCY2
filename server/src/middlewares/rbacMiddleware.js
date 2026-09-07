const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getAdminSecret = () => process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET;

// Strictly verify the short-lived access token
const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const secret = getAdminSecret();
      if (!secret) {
        return res.status(500).json({ message: 'Server configuration error: JWT secret missing' });
      }
      const decoded = jwt.verify(token, secret);
      // We only allow these roles in the admin panel
      if (decoded && decoded.role && ['support-staff', 'manager', 'super-admin'].includes(decoded.role)) {
        req.user = await User.findById(decoded.userId).select('-password');
        if (req.user && req.user.role === decoded.role) {
          return next();
        } else {
          return res.status(401).json({ message: 'Role mismatch or user not found' });
        }
      } else {
        return res.status(403).json({ message: 'Not authorized for admin access' });
      }
    } catch (error) {
      return res.status(401).json({ message: 'Access token expired or invalid' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no access token' });
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

// Check if user has a specific permission (super-admin bypasses)
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === 'super-admin' || (req.user.permissions && req.user.permissions.includes(permission)))) {
      next();
    } else {
      res.status(403).json({ message: `Forbidden: Missing permission '${permission}'` });
    }
  };
};

module.exports = { protectAdmin, requireRole, requirePermission };
