const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
      },
      name: { type: String, required: true },
      image: { type: String },
      qty: { type: Number, required: true },
      size: { type: String },
      color: { type: String },
      reason: { type: String, required: true },
      notes: { type: String }
    }
  ],
  type: {
    type: String,
    enum: ['Return', 'Exchange'],
    required: true
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Rejected', 'Picked Up', 'In Transit', 'Processed'],
    default: 'Requested'
  },
  refundMethod: {
    type: String
  },
  adminNotes: {
    type: String
  }
}, { timestamps: true });

const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
module.exports = ReturnRequest;
