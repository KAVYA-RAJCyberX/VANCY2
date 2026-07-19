const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/productController');

router.route('/').get(getProducts);
router.route('/:slug').get(getProductBySlug);

module.exports = router;
