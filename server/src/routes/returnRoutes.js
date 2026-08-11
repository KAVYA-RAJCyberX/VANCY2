const express = require('express');
const router = express.Router();
const { createReturnRequest, getMyReturns, getReturns, updateReturnStatus } = require('../controllers/returnController');
const { protect } = require('../middlewares/authMiddleware');
const { protectAdmin, requireRole } = require('../middlewares/rbacMiddleware');

router.route('/')
  .post(protect, createReturnRequest)
  .get(protectAdmin, requireRole(['manager', 'super-admin', 'support-staff']), getReturns);

router.route('/my-returns')
  .get(protect, getMyReturns);

router.route('/:id/status')
  .put(protectAdmin, requireRole(['manager', 'super-admin', 'support-staff']), updateReturnStatus);

module.exports = router;
