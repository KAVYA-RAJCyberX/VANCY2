const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { protectAdmin } = require('../middlewares/rbacMiddleware');

// @desc    Upload multiple images
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protectAdmin, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => file.path);
    res.json({ urls: imageUrls });
  } catch (error) {
    res.status(500).json({ message: 'Server error during upload', error: error.message });
  }
});

module.exports = router;
