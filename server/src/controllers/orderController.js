const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to create an order' });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      isPaid,
      paidAt,
      itemsPrice,
      shippingPrice,
      totalPrice,
      guestEmail
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const formattedOrderItems = [];
    let calculatedItemsPrice = 0;

    for (const x of orderItems) {
      let productId = x.product;
      let dbProduct;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        dbProduct = await Product.findOne({ slug: productId });
      } else {
        dbProduct = await Product.findById(productId);
      }

      if (!dbProduct) {
        return res.status(400).json({ message: `Product not found: ${productId}` });
      }

      const qty = Number(x.qty) || 1;
      const size = x.size || 'M';
      const color = x.color || 'Standard';

      // Check variant stock if variants exist
      if (dbProduct.variants && dbProduct.variants.length > 0) {
        const variant = dbProduct.variants.find(
          v => v.size.toLowerCase() === size.toLowerCase() && v.color.toLowerCase() === color.toLowerCase()
        );
        if (variant && variant.stock < qty) {
          return res.status(400).json({
            message: `Insufficient stock for ${dbProduct.name} (${size} / ${color}). Available: ${variant.stock}`
          });
        }
      }

      if (dbProduct.limitedEditionStock !== undefined && dbProduct.limitedEditionStock !== null && dbProduct.limitedEditionStock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for limited edition product ${dbProduct.name}. Available: ${dbProduct.limitedEditionStock}`
        });
      }

      const price = dbProduct.price;
      calculatedItemsPrice += price * qty;

      formattedOrderItems.push({
        name: dbProduct.name,
        qty: qty,
        image: x.image || dbProduct.images[0],
        price: price,
        size: size,
        color: color,
        product: dbProduct._id
      });
    }

    const order = new Order({
      orderItems: formattedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentResult: {},
      isPaid: false,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: calculatedItemsPrice + (Number(shippingPrice) || 0),
    });

    const createdOrder = await order.save();

    // Decrement stock for ordered items
    for (const item of formattedOrderItems) {
      await Product.updateOne(
        {
          _id: item.product,
          'variants.size': item.size,
          'variants.color': item.color
        },
        { $inc: { 'variants.$.stock': -item.qty } }
      );
      await Product.updateOne(
        {
          _id: item.product,
          limitedEditionStock: { $exists: true, $ne: null }
        },
        { $inc: { limitedEditionStock: -item.qty } }
      );
    }

    // Auto-save shipping address if not already present
    if (req.user && shippingAddress && shippingAddress.street) {
      const user = await require('../models/User').findById(req.user._id);
      if (user) {
        const exists = user.savedAddresses.some(
          addr => addr.street === shippingAddress.street && addr.city === shippingAddress.city
        );
        if (!exists) {
          user.savedAddresses.push({
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country
          });
          // Keep max 6 addresses
          if (user.savedAddresses.length > 6) {
            user.savedAddresses.shift();
          }
          await user.save();
        }
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private or Guest with ID
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    if (order.user && order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { addOrderItems, getOrderById, getMyOrders };
