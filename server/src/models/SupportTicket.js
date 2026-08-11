const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['Customer', 'Admin'],
    required: true
  },
  senderRole: { // Can track which specific admin replied
    type: String
  },
  message: {
    type: String,
    required: true
  },
  images: [{ type: String }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order' // Optional, ticket might be general
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Optional
  },
  category: {
    type: String,
    enum: [
      'Order Delay', 
      'Wrong/Damaged Item Received', 
      'Size/Fit Issue', 
      'Return/Exchange Status', 
      'Refund Not Received', 
      'Payment Issue', 
      'Product Quality', 
      'Website/Account Issue', 
      'Other'
    ],
    required: true
  },
  subject: { // Legacy or generated from category
    type: String
  },
  customMessage: {
    type: String // Required if category is 'Other'
  },
  attachedImages: [{ type: String }],
  status: {
    type: String,
    enum: ['raised', 'under_review', 'replied', 'return_accepted', 'returned', 'resolved', 'reopened'],
    default: 'raised'
  },
  statusHistory: [statusHistorySchema],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Staff assignment
  },
  thread: [messageSchema]
}, { timestamps: true });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
module.exports = SupportTicket;
