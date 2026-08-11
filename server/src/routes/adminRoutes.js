const express = require('express');
const router = express.Router();
const { protectAdmin, requireRole } = require('../middlewares/rbacMiddleware');
const {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminStaff,
  updateStaffRole,
  getAuditLogs,
  getDetailedAnalytics,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getProductInsights,
  updateProductStock,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { getTickets, updateTicketStatus, replyToTicket } = require('../controllers/supportController');

// All routes require a valid admin JWT
router.use(protectAdmin);

// Dashboard
router.get('/dashboard', requireRole(['manager', 'super-admin']), getDashboardStats);

// Orders
router.get('/orders', requireRole(['support-staff', 'manager', 'super-admin']), getAdminOrders);
router.put('/orders/:id/status', requireRole(['support-staff', 'manager', 'super-admin']), updateOrderStatus);

// Customers
router.get('/customers', requireRole(['support-staff', 'manager', 'super-admin']), getAdminCustomers);

// Staff & Audit Logs (Super Admin only)
router.get('/staff', requireRole(['super-admin']), getAdminStaff);
router.put('/staff/:id/role', requireRole(['super-admin']), updateStaffRole);
router.get('/audit-logs', requireRole(['super-admin']), getAuditLogs);

// Analytics & Coupons
router.get('/analytics', requireRole(['manager', 'super-admin']), getDetailedAnalytics);
router.get('/coupons', requireRole(['manager', 'super-admin']), getAdminCoupons);
router.post('/coupons', requireRole(['manager', 'super-admin']), createCoupon);
router.put('/coupons/:id', requireRole(['manager', 'super-admin']), updateCoupon);
router.delete('/coupons/:id', requireRole(['manager', 'super-admin']), deleteCoupon);

// Product Insights & Management
router.get('/products/:id/cross-reference', requireRole(['support-staff', 'manager', 'super-admin']), getProductInsights);
router.put('/products/:id/stock', requireRole(['support-staff', 'manager', 'super-admin']), updateProductStock);

// Support Tickets
router.get('/support', requireRole(['support-staff', 'manager', 'super-admin']), getTickets);
router.put('/support/:id/status', requireRole(['support-staff', 'manager', 'super-admin']), updateTicketStatus);
router.post('/support/:id/reply', requireRole(['support-staff', 'manager', 'super-admin']), replyToTicket);

// Settings
router.get('/settings', requireRole(['manager', 'super-admin']), getSettings);
router.put('/settings', requireRole(['manager', 'super-admin']), updateSettings);

module.exports = router;
