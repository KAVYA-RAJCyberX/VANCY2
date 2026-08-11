const SupportTicket = require('../models/SupportTicket');

// @desc    Create new support ticket
// @route   POST /api/support
// @access  Private
const createTicket = async (req, res) => {
  try {
    const { orderId, productId, category, subject, message, customMessage, attachedImages } = req.body;

    const ticket = new SupportTicket({
      user: req.user._id,
      orderId: orderId || null,
      productId: productId || null,
      category,
      subject: subject || category, // fallback
      customMessage,
      attachedImages: attachedImages || [],
      status: 'raised',
      statusHistory: [{
        status: 'raised',
        timestamp: new Date()
      }],
      thread: [{
        sender: 'Customer',
        message,
        images: attachedImages || [],
        timestamp: new Date()
      }]
    });

    const createdTicket = await ticket.save();
    res.status(201).json(createdTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user tickets
// @route   GET /api/support/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a ticket
// @route   POST /api/support/:id/reply
// @access  Private
const replyToTicket = async (req, res) => {
  try {
    const { message, images } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);

    if (ticket) {
      // If customer is replying, ensure they own it. Admins bypass this.
      const isAdmin = req.user && ['support-staff', 'manager', 'super-admin'].includes(req.user.role);
      
      if (!isAdmin && ticket.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this ticket' });
      }

      const sender = isAdmin ? 'Admin' : 'Customer';
      
      ticket.thread.push({
        sender,
        senderRole: isAdmin ? req.user.role : undefined,
        message,
        images: images || [],
        timestamp: new Date()
      });
      
      if (isAdmin && ticket.status === 'raised') {
        ticket.status = 'replied';
        ticket.statusHistory.push({ status: 'replied', changedBy: req.user._id, timestamp: new Date() });
      } else if (!isAdmin && (ticket.status === 'resolved' || ticket.status === 'closed')) {
        ticket.status = 'reopened';
        ticket.statusHistory.push({ status: 'reopened', timestamp: new Date() });
      }

      const updatedTicket = await ticket.save();
      res.status(201).json(updatedTicket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/support
// @access  Private/Admin
const getTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({})
      .populate('user', 'id name email')
      .populate('assignedTo', 'id name')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update ticket status and assignment
// @route   PUT /api/support/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (ticket) {
      if (req.body.status && req.body.status !== ticket.status) {
        ticket.status = req.body.status;
        ticket.statusHistory.push({
          status: req.body.status,
          changedBy: req.user._id,
          timestamp: new Date()
        });
      }

      if (req.body.assignedTo !== undefined) {
        ticket.assignedTo = req.body.assignedTo || null;
      }

      const updatedTicket = await ticket.save();
      res.json(updatedTicket);
    } else {
      res.status(404).json({ message: 'Ticket not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTicket,
  getMyTickets,
  replyToTicket,
  getTickets,
  updateTicketStatus
};
