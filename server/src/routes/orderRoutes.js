const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(getOrderById);

module.exports = router;
