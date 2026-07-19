const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, name, photoUrl } = req.body;

    // Check if user has purchased this product
    const orders = await Order.find({ user: req.user._id, isPaid: true });
    
    let hasPurchased = false;
    for (const order of orders) {
      const itemExists = order.orderItems.find(item => item.product.toString() === productId);
      if (itemExists) {
        hasPurchased = true;
        break;
      }
    }

    if (!hasPurchased) {
      return res.status(400).json({ message: 'You must purchase this product before writing a review.' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ product: productId, user: req.user._id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = new Review({
      product: productId,
      user: req.user._id,
      name,
      rating: Number(rating),
      comment,
      photoUrl
    });

    await review.save();

    // Update product stats
    const allReviews = await Review.find({ product: productId });
    const numReviews = allReviews.length;
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
