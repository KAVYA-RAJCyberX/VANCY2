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
  getAuditLogs
} = require('../controllers/adminController');

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

module.exports = router;
