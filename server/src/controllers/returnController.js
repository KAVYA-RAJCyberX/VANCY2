const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

// @desc    Create new return/exchange request
// @route   POST /api/returns
// @access  Private
const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, type, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    const returnRequest = new ReturnRequest({
      user: req.user._id,
      orderId,
      items,
      type,
      notes
    });

    const createdRequest = await returnRequest.save();
    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user returns
// @route   GET /api/returns/my-returns
// @access  Private
const getMyReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all returns
// @route   GET /api/returns
// @access  Private/Admin
const getReturns = async (req, res) => {
  try {
    const returns = await ReturnRequest.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
  try {
    const returnReq = await ReturnRequest.findById(req.params.id);

    if (returnReq) {
      returnReq.status = req.body.status || returnReq.status;
      returnReq.adminNotes = req.body.adminNotes || returnReq.adminNotes;
      returnReq.refundMethod = req.body.refundMethod || returnReq.refundMethod;

      const updatedReturn = await returnReq.save();
      res.json(updatedReturn);
    } else {
      res.status(404).json({ message: 'Return request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturns,
  getReturns,
  updateReturnStatus
};
