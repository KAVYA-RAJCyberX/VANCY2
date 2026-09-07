const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/razorpay', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
