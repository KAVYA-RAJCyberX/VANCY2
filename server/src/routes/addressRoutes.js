const express = require('express');
const router = express.Router();
const { getAddresses, createAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAddresses);
router.post('/', protect, createAddress);
router.delete('/:id', protect, deleteAddress);

module.exports = router;
