const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist;
    if (req.user) {
      wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    } else if (req.query.sessionId) {
      wishlist = await Wishlist.findOne({ sessionId: req.query.sessionId }).populate('products');
    }

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle wishlist item
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId, sessionId } = req.body;
    
    let wishlist;
    if (req.user) {
      wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
    } else {
      wishlist = await Wishlist.findOne({ sessionId });
      if (!wishlist) wishlist = new Wishlist({ sessionId, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Merge guest wishlist to user wishlist
exports.mergeWishlist = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || !req.user) return res.status(200).json({ message: 'No merge needed' });

    const guestWishlist = await Wishlist.findOne({ sessionId });
    if (!guestWishlist || guestWishlist.products.length === 0) return res.status(200).json({ message: 'Guest wishlist empty' });

    let userWishlist = await Wishlist.findOne({ user: req.user._id });
    if (!userWishlist) {
      userWishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Merge items avoiding duplicates
    for (let pId of guestWishlist.products) {
      if (!userWishlist.products.includes(pId)) {
        userWishlist.products.push(pId);
      }
    }

    await userWishlist.save();
    await Wishlist.deleteOne({ sessionId });

    res.status(200).json(userWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
