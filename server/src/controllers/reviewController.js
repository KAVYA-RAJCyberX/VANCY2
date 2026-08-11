const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, name, images } = req.body;

    // Check if user has purchased this product
    const orders = await Order.find({ user: req.user._id, isDelivered: true });
    
    let hasPurchased = false;
    let purchaseOrderId = null;
    
    for (const order of orders) {
      const itemExists = order.orderItems.find(item => item.product.toString() === productId);
      if (itemExists) {
        hasPurchased = true;
        purchaseOrderId = order._id;
        break;
      }
    }

    if (!hasPurchased) {
      return res.status(400).json({ message: 'You must have a delivered order for this product before writing a review.' });
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
      images: images || [],
      orderId: purchaseOrderId,
      isHidden: false
    });

    await review.save();

    // Update product stats
    const allReviews = await Review.find({ product: productId, isHidden: false });
    const numReviews = allReviews.length;
    const avgRating = numReviews > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      numReviews
    });

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    // Only return non-hidden reviews
    const reviews = await Review.find({ product: req.params.productId, isHidden: false }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name image price slug')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('product', 'name image slug')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Hide/Unhide review (Admin)
// @route   PUT /api/reviews/:id/hide
// @access  Private/Admin
exports.hideReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isHidden = !review.isHidden;
    await review.save();

    // Update product stats based on visibility
    const allReviews = await Review.find({ product: review.product, isHidden: false });
    const numReviews = allReviews.length;
    const avgRating = numReviews > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: avgRating,
      numReviews
    });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
