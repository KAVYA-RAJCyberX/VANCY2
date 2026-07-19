const mongoose = require('mongoose');


const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  images: [{ type: String, required: true }],
  fabricDescription: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  variants: [variantSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isLuxury: { type: Boolean, default: false },
  luxuryTier: { type: String, enum: ['Gold', 'Platinum', 'Black'], required: function() { return this.isLuxury; } },
  limitedEdition: { type: Number },
  limitedEditionStock: { type: Number }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
