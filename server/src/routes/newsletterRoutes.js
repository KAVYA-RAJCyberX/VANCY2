const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.json({ message: 'Already subscribed' });
    }
    
    await Newsletter.create({ email });
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to subscribe', error: error.message });
  }
});

module.exports = router;
