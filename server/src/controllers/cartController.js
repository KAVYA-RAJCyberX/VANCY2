const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for user or session
exports.getCart = async (req, res) => {
  try {
    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    } else if (req.query.sessionId) {
      cart = await Cart.findOne({ sessionId: req.query.sessionId }).populate('items.product');
    }

    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color, sessionId } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = new Cart({ user: req.user._id, items: [] });
    } else {
      cart = await Cart.findOne({ sessionId });
      if (!cart) cart = new Cart({ sessionId, items: [] });
    }

    // Check if item exists
    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId && p.size === size && p.color === color);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity,
        size,
        color
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, sessionId } = req.body;

    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      item.deleteOne();
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { sessionId } = req.query; // For DELETE requests, use query params if needed

    let cart;
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull({ _id: itemId });
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Merge guest cart to user cart
exports.mergeCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || !req.user) return res.status(200).json({ message: 'No merge needed' });

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) return res.status(200).json({ message: 'Guest cart empty' });

    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = new Cart({ user: req.user._id, items: [] });
    }

    // Merge items
    for (let gItem of guestCart.items) {
      const itemIndex = userCart.items.findIndex(p => p.product.toString() === gItem.product.toString() && p.size === gItem.size && p.color === gItem.color);
      if (itemIndex > -1) {
        userCart.items[itemIndex].quantity += gItem.quantity;
      } else {
        userCart.items.push(gItem);
      }
    }

    await userCart.save();
    await Cart.deleteOne({ sessionId }); // Clean up guest cart

    res.status(200).json(userCart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
