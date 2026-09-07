const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay
// @access  Public
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) return res.status(404).json({ message: 'Order not found' });
    
    if (dbOrder.user && dbOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    const amount = dbOrder.totalPrice;

    const key_id = process.env.RAZORPAY_KEY_ID || 'test_key_id';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';

    // If using dummy / test credentials, generate a mock order for development
    if (!key_id || key_id === 'test_key_id' || key_id === 'dummy_key_id' || !key_id.startsWith('rzp_')) {
      const mockOrderId = `order_mock_${Math.floor(Math.random() * 1000000)}`;
      
      dbOrder.paymentResult = { razorpayOrderId: mockOrderId };
      await dbOrder.save();
      
      const mockOrder = {
        id: mockOrderId,
        entity: 'order',
        amount: Math.round(amount * 100),
        amount_paid: 0,
        amount_due: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_${dbOrder._id}`,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      };
      return res.json(mockOrder);
    }

    const instance = new Razorpay({ key_id, key_secret });
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${dbOrder._id}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    dbOrder.paymentResult = { razorpayOrderId: order.id };
    await dbOrder.save();

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

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ message: "Missing Razorpay payment details" });
    }

    const order = await Order.findOne({ 'paymentResult.razorpayOrderId': razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found for this payment' });
    }

    if (order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to verify payment for this order' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'test_key_secret';

    // Mock verification for development/testing
    if (razorpayOrderId.startsWith('order_mock_') || key_secret === 'test_key_secret' || key_secret === 'dummy_key_secret') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
        razorpaySignature: razorpaySignature || 'mock_signature',
        status: 'Paid'
      };
      const updatedOrder = await order.save();
      return res.status(200).json({ message: "Payment verified successfully (Mock)", order: updatedOrder });
    }

    if (!razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay signature" });
    }

    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpaySignature === expectedSign) {
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
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
