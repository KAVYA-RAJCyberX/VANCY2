const express = require('express');
const router = express.Router();
const { authUser, registerUser, logoutUser, getUserProfile, addAddress, updateAddress, removeAddress } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/login', authUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.route('/profile').get(protect, getUserProfile);
router.post('/profile/addresses', protect, addAddress);
router.put('/profile/addresses/:id', protect, updateAddress);
router.delete('/profile/addresses/:id', protect, removeAddress);

module.exports = router;
