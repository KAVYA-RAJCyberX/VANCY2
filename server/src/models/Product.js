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
  description: { type: String, default: '' },
  images: [{ type: String, required: true }],
  fabricDescription: { type: String, required: true },
  fabric: { type: String, default: '' },
  category: { type: String, required: true },
  subCategory: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discountPrice: { type: Number },
  sizes: [{ type: String }],
  colors: [{ type: String }],
  variants: [variantSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isLuxury: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  luxuryTier: { type: String, enum: ['Gold', 'Platinum', 'Black'], required: function() { return this.isLuxury; } },
  limitedEdition: { type: Number },
  limitedEditionStock: { type: Number },
  sizeChartType: { type: String, enum: ['polo', 'jogger'], default: 'polo' },
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', fabricDescription: 'text' });

// Add indexes for commonly queried fields
productSchema.index({ category: 1 });
productSchema.index({ isSale: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
