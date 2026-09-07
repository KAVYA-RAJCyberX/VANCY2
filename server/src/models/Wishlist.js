const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String }, // For guest wishlists
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ sessionId: 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
