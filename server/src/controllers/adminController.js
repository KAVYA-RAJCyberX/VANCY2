const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Coupon = require('../models/Coupon');

// Helper to log admin actions
const logAction = async (adminId, actionType, collectionName, documentId, beforeValue, afterValue, req) => {
  try {
    await AuditLog.create({
      adminId,
      actionType,
      collectionName,
      documentId,
      beforeValue,
      afterValue,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const totalSalesToday = todayOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pendingOrdersCount = await Order.countDocuments({ isDelivered: false });

    // Assuming a threshold of 5 for low stock
    const lowStockProducts = await Product.find({ 'variants.stock': { $lt: 5 } }).select('name variants');

    res.json({
      salesToday: totalSalesToday,
      ordersToday: todayOrders.length,
      pendingOrders: pendingOrdersCount,
      lowStockCount: lowStockProducts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const beforeStatus = order.isDelivered ? 'Delivered' : 'Pending';
    
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'Pending') {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    await order.save();

    await logAction(req.user._id, 'UPDATE_ORDER_STATUS', 'Order', order._id, { status: beforeStatus }, { status, note }, req);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
const getAdminCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get staff members
// @route   GET /api/admin/staff
const getAdminStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['support-staff', 'manager', 'super-admin'] } }).select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update staff role
// @route   PUT /api/admin/staff/:id/role
const updateStaffRole = async (req, res) => {
  try {
    const { role } = req.body;
    const staff = await User.findById(req.params.id);
    
    if (!staff) return res.status(404).json({ message: 'User not found' });

    const beforeRole = staff.role;
    staff.role = role;
    await staff.save();

    await logAction(req.user._id, 'UPDATE_STAFF_ROLE', 'User', staff._id, { role: beforeRole }, { role }, req);

    res.json({ message: 'Role updated successfully', staff });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('adminId', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Detailed Analytics
// @route   GET /api/admin/analytics
const getDetailedAnalytics = async (req, res) => {
  try {
    // Simple 30-day analytics aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Group by day
    const salesByDay = {};
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!salesByDay[dateStr]) salesByDay[dateStr] = 0;
      salesByDay[dateStr] += order.totalPrice;
    });

    const chartData = Object.keys(salesByDay).sort().map(date => ({
      date,
      sales: salesByDay[date]
    }));

    res.json({
      totalRevenue30d: chartData.reduce((acc, curr) => acc + curr.sales, 0),
      totalOrders30d: orders.length,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get All Coupons
// @route   GET /api/admin/coupons
const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminStaff,
  updateStaffRole,
  getAuditLogs,
  getDetailedAnalytics,
  getAdminCoupons
};
