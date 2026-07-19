const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, mergeWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => getWishlist(req, res));
  } else {
    getWishlist(req, res);
  }
});

router.post('/toggle', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    protect(req, res, () => toggleWishlist(req, res));
  } else {
    toggleWishlist(req, res);
  }
});

router.post('/merge', protect, mergeWishlist);

module.exports = router;
