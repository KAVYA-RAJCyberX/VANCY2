const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, mergeCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', (req, res, next) => {
  // Try to use protect if user has token, otherwise act as guest
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => getCart(req, res));
  } else {
    getCart(req, res);
  }
});

router.post('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => addToCart(req, res));
  } else {
    addToCart(req, res);
  }
});

router.put('/:itemId', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => updateCartItem(req, res));
  } else {
    updateCartItem(req, res);
  }
});

router.delete('/:itemId', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => removeFromCart(req, res));
  } else {
    removeFromCart(req, res);
  }
});

router.post('/merge', protect, mergeCart);

module.exports = router;
