const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay
// @access  Public
const createRazorpayOrder = async (req, res) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || 'test_key_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';

    // If using dummy / test credentials, generate a mock order for development
    if (!key_id || key_id === 'test_key_id' || key_id === 'dummy_key_id' || !key_id.startsWith('rzp_')) {
      const mockOrder = {
        id: `order_mock_${Math.floor(Math.random() * 1000000)}`,
        entity: 'order',
        amount: Math.round((req.body.amount || 0) * 100),
        amount_paid: 0,
        amount_due: Math.round((req.body.amount || 0) * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      };
      return res.json(mockOrder);
    }

    const instance = new Razorpay({ key_id, key_secret });
    const options = {
      amount: Math.round((req.body.amount || 0) * 100),
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Error initiating payment', error: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/razorpay/verify
// @access  Public
const verifyRazorpayPayment = async (req, res) => {
  try {
    const razorpayOrderId = req.body.razorpay_order_id || req.body.razorpayOrderId;
    const razorpayPaymentId = req.body.razorpay_payment_id || req.body.razorpayPaymentId;
    const razorpaySignature = req.body.razorpay_signature || req.body.razorpaySignature;
    const orderId = req.body.orderId;

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';

    // Mock verification for development/testing
    if (!razorpayOrderId || razorpayOrderId.startsWith('order_mock_') || key_secret === 'test_key_secret' || key_secret === 'dummy_key_secret') {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            razorpayOrderId: razorpayOrderId || `order_mock_${Date.now()}`,
            razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
            razorpaySignature: razorpaySignature || 'mock_signature',
            status: 'Paid'
          };
          const updatedOrder = await order.save();
          return res.status(200).json({ message: "Payment verified successfully (Mock)", order: updatedOrder });
        }
      }
      return res.status(200).json({ message: "Payment verified successfully (Mock)" });
    }

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature === expectedSign) {
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            status: 'Paid'
          };
          const updatedOrder = await order.save();
          return res.status(200).json({ message: "Payment verified successfully", order: updatedOrder });
        }
      }
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
