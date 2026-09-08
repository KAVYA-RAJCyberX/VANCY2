const express = require('express');
const router = express.Router();
const { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, addAddress, updateAddress, removeAddress, setDefaultAddress, requestDataExportDelete } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, authUser);
router.post('/register', authLimiter, registerUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/profile/dpdp-request', protect, requestDataExportDelete);
router.post('/profile/addresses', protect, addAddress);
router.put('/profile/addresses/:id', protect, updateAddress);
router.put('/profile/addresses/:id/default', protect, setDefaultAddress);
router.delete('/profile/addresses/:id', protect, removeAddress);

module.exports = router;
