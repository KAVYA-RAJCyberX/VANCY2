const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refreshToken: { type: String, required: true },
  deviceInfo: { type: String },
  ipAddress: { type: String },
  lastActive: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// Create a TTL index so MongoDB automatically deletes expired sessions
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminSession = mongoose.model('AdminSession', adminSessionSchema);
module.exports = AdminSession;
