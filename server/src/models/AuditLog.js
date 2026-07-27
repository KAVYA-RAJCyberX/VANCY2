const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, required: true },
  collectionName: { type: String, required: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  beforeValue: { type: mongoose.Schema.Types.Mixed },
  afterValue: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
