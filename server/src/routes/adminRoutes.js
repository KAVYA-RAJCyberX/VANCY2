const express = require('express');
const router = express.Router();
const { protectAdmin, requireRole } = require('../middlewares/rbacMiddleware');
const {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminStaff,
  updateStaffAccess,
  getAuditLogs,
  getDetailedAnalytics,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminProducts,
  inviteStaff,
  getProductInsights,
  updateProductStock,
  createProduct,
  updateProduct,
  deleteProduct,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { getTickets, updateTicketStatus, replyToTicket } = require('../controllers/supportController');
const { getActiveSessions, terminateSession, updatePassword, toggle2FA } = require('../controllers/adminProfileController');

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
const { getInvitations, resendInvitation, cancelInvitation } = require('../controllers/adminInviteController');
router.get('/staff', requireRole(['super-admin']), getAdminStaff);
router.post('/staff/invite', requireRole(['super-admin']), inviteStaff);
router.get('/staff/invites', requireRole(['super-admin']), getInvitations);
router.post('/staff/invites/:id/resend', requireRole(['super-admin']), resendInvitation);
router.post('/staff/invites/:id/cancel', requireRole(['super-admin']), cancelInvitation);
router.put('/staff/:id/access', requireRole(['super-admin']), updateStaffAccess);
router.get('/audit-logs', requireRole(['super-admin']), getAuditLogs);

// Analytics & Coupons
router.get('/analytics', requireRole(['manager', 'super-admin']), getDetailedAnalytics);
router.get('/coupons', requireRole(['manager', 'super-admin']), getAdminCoupons);
router.post('/coupons', requireRole(['manager', 'super-admin']), createCoupon);
router.put('/coupons/:id', requireRole(['manager', 'super-admin']), updateCoupon);
router.delete('/coupons/:id', requireRole(['manager', 'super-admin']), deleteCoupon);

// Product Insights & Management
router.get('/products', requireRole(['support-staff', 'manager', 'super-admin']), getAdminProducts);
router.get('/products/:id/cross-reference', requireRole(['support-staff', 'manager', 'super-admin']), getProductInsights);
router.put('/products/:id/stock', requireRole(['support-staff', 'manager', 'super-admin']), updateProductStock);
router.post('/products', requireRole(['manager', 'super-admin']), createProduct);
router.put('/products/:id', requireRole(['manager', 'super-admin']), updateProduct);
router.delete('/products/:id', requireRole(['manager', 'super-admin']), deleteProduct);

// Support Tickets
router.get('/support', requireRole(['support-staff', 'manager', 'super-admin']), getTickets);
router.put('/support/:id/status', requireRole(['support-staff', 'manager', 'super-admin']), updateTicketStatus);
router.post('/support/:id/reply', requireRole(['support-staff', 'manager', 'super-admin']), replyToTicket);

// Settings
router.get('/settings', requireRole(['manager', 'super-admin']), getSettings);
router.put('/settings', requireRole(['manager', 'super-admin']), updateSettings);

// Profile & Sessions
router.get('/profile/sessions', getActiveSessions);
router.delete('/profile/sessions/:id', terminateSession);
router.put('/profile/password', updatePassword);
router.post('/profile/2fa/toggle', toggle2FA);

module.exports = router;
