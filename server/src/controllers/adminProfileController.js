const User = require('../models/User');
const AdminSession = require('../models/AdminSession');
const AuditLog = require('../models/AuditLog');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Helper
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

// @desc    Get active sessions
// @route   GET /api/admin/profile/sessions
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await AdminSession.find({ adminId: req.user._id }).sort({ lastActive: -1 });
    
    // We want to identify the current session
    const currentRefreshToken = req.cookies.admin_refresh_token;
    
    const formattedSessions = sessions.map(session => ({
      _id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      expiresAt: session.expiresAt,
      isCurrent: session.refreshToken === currentRefreshToken
    }));

    res.json(formattedSessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Terminate a specific session
// @route   DELETE /api/admin/profile/sessions/:id
const terminateSession = async (req, res) => {
  try {
    const session = await AdminSession.findById(req.params.id);
    
    if (!session || session.adminId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await AdminSession.deleteOne({ _id: session._id });
    await logAction(req.user._id, 'TERMINATE_SESSION', 'AdminSession', session._id, null, null, req);
    
    res.json({ message: 'Session terminated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/admin/profile/password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword;
      await user.save();
      await logAction(req.user._id, 'UPDATE_PASSWORD', 'User', user._id, null, null, req);
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Toggle 2FA
// @route   POST /api/admin/profile/2fa/toggle
const toggle2FA = async (req, res) => {
  try {
    const { token, action } = req.body; // action: 'enable' | 'disable'
    const user = await User.findById(req.user._id);

    if (action === 'disable') {
      // Need a valid token to disable
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      });

      if (verified) {
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined; // clear it
        await user.save();
        await logAction(req.user._id, 'DISABLE_2FA', 'User', user._id, { enabled: true }, { enabled: false }, req);
        res.json({ message: '2FA disabled successfully' });
      } else {
        res.status(401).json({ message: 'Invalid 2FA token' });
      }
    } else if (action === 'enable') {
      // Step 1: Requesting to enable (generate secret)
      if (!token) {
        const secret = speakeasy.generateSecret({ name: `Vancy Admin (${user.email})` });
        user.twoFactorSecret = secret.base32;
        await user.save();
        
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
          if (err) return res.status(500).json({ message: 'Error generating QR code' });
          return res.json({ 
            message: 'Scan the QR code and provide token to confirm',
            qrCode: data_url
          });
        });
      } else {
        // Step 2: Confirming enablement with token
        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token
        });

        if (verified) {
          user.twoFactorEnabled = true;
          await user.save();
          await logAction(req.user._id, 'ENABLE_2FA', 'User', user._id, { enabled: false }, { enabled: true }, req);
          res.json({ message: '2FA enabled successfully' });
        } else {
          res.status(401).json({ message: 'Invalid 2FA token' });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getActiveSessions,
  terminateSession,
  updatePassword,
  toggle2FA
};
