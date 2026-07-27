const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { adminLogin, verify2FA, refreshToken, adminLogout } = require('../controllers/adminAuthController');

// Rate limiting for admin login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, adminLogin);
router.post('/verify-2fa', loginLimiter, verify2FA);
router.post('/refresh', refreshToken);
router.post('/logout', adminLogout);

module.exports = router;
