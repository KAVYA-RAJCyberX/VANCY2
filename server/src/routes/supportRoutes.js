const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, replyToTicket } = require('../controllers/supportController');
const { protect } = require('../middlewares/authMiddleware');

// Note: A single endpoint could handle both Customer (protect) and Admin (protectAdmin).
// For simplicity, we can have separate customer and admin endpoints for fetching, 
// or use a custom middleware that handles both. Since we already use token from cookies for protect
// and Bearer for protectAdmin, we will keep routes standard.

router.route('/')
  .post(protect, createTicket);

router.route('/my-tickets')
  .get(protect, getMyTickets);

// Customer replying to a ticket
router.route('/:id/reply')
  .post(protect, replyToTicket);

module.exports = router;
