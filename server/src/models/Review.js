const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  photoUrl: { type: String }, // Legacy field, keeping for backwards compatibility
  images: [{ type: String }],
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
