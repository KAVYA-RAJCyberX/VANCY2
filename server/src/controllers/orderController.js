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
    for (const x of orderItems) {
      let productId = x.product;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        const found = await Product.findOne({ slug: productId });
        if (found) {
          productId = found._id;
        } else {
          const firstProd = await Product.findOne();
          if (firstProd) {
            productId = firstProd._id;
          }
        }
      }

      formattedOrderItems.push({
        name: x.name || 'Product',
        qty: Number(x.qty) || 1,
        image: x.image || '/images/tshirts/mustard-yellow/mustard-yellow-polo.png',
        price: Number(x.price) || 0,
        size: x.size || 'M',
        color: x.color || 'Standard',
        product: productId
      });
    }

    const order = new Order({
      orderItems: formattedOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentResult: paymentResult || {},
      isPaid: Boolean(isPaid),
      paidAt: paidAt ? new Date(paidAt) : undefined,
      itemsPrice: Number(itemsPrice) || 0,
      shippingPrice: Number(shippingPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
    });

    const createdOrder = await order.save();

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
