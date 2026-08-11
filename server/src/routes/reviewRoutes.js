const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getMyReviews, getAllReviews, hideReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');
const { protectAdmin, requireRole } = require('../middlewares/rbacMiddleware');

router.get('/my-reviews', protect, getMyReviews);
router.post('/', protect, createReview);

// Admin routes
router.get('/', protectAdmin, requireRole(['support-staff', 'manager', 'super-admin']), getAllReviews);
router.put('/:id/hide', protectAdmin, requireRole(['manager', 'super-admin']), hideReview);

router.get('/product/:productId', getProductReviews);

module.exports = router;
