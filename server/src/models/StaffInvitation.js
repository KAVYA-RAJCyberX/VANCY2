const mongoose = require('mongoose');

const staffInvitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['support-staff', 'manager', 'super-admin'],
    required: true
  },
  permissions: {
    type: [String],
    enum: ['manage_users', 'manage_products', 'manage_orders', 'view_analytics', 'manage_settings'],
    default: []
  },
  tokenHash: {
    type: String,
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Create a TTL index to automatically remove expired invitations after some time (optional, we can also just leave them marked as expired)
// staffInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const StaffInvitation = mongoose.model('StaffInvitation', staffInvitationSchema);
module.exports = StaffInvitation;
