const crypto = require('crypto');
const StaffInvitation = require('../models/StaffInvitation');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const nodemailer = require('nodemailer');

// Reuse existing logic from adminController for audit logging if possible, but we'll inline a simple version here
const logAction = async (adminId, actionType, collectionName, documentId, beforeValue, afterValue, req) => {
  try {
    if (!adminId) return; // public route accept might not have adminId until user is created
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

const sendInviteEmail = async (email, token, role) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
    const inviteLink = `${baseUrl}/admin/invite/accept/${token}`;
    
    // For local testing: log the invite link so it can be clicked
    console.log('\n=============================================');
    console.log(`✉️ SIMULATED EMAIL TO: ${email}`);
    console.log(`🔗 INVITE LINK: ${inviteLink}`);
    console.log('=============================================\n');

    const mailOptions = {
      from: `"Vancy Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'You have been invited to Vancy Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
          <h2 style="color: #000;">Welcome to Vancy</h2>
          <p>You have been invited to join the Vancy Admin Panel as a <strong>${role.replace('-', ' ')}</strong>.</p>
          <p>Please click the button below to accept the invitation and set up your password.</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 14px;">This invitation link will expire in 48 hours.</p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">If you did not expect this invitation, you can safely ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send invite email:', error);
    // Don't throw, we still want the DB record to be created even if email fails in dev
  }
};

// @desc    Get all invitations (super-admin only)
// @route   GET /api/admin/invitations
const getInvitations = async (req, res) => {
  try {
    const invitations = await StaffInvitation.find()
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resend invitation (super-admin only)
// @route   POST /api/admin/invitations/:id/resend
const resendInvitation = async (req, res) => {
  try {
    const invitation = await StaffInvitation.findById(req.params.id);
    
    if (!invitation || invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed invitation' });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    invitation.tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    invitation.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // Reset expiry to 48h
    await invitation.save();

    await sendInviteEmail(invitation.email, token, invitation.role);
    
    await logAction(req.user._id, 'RESEND_INVITE', 'StaffInvitation', invitation._id, null, null, req);

    res.json({ message: 'Invitation resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel invitation (super-admin only)
// @route   POST /api/admin/invitations/:id/cancel
const cancelInvitation = async (req, res) => {
  try {
    const invitation = await StaffInvitation.findById(req.params.id);
    
    if (!invitation || invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invalid or already processed invitation' });
    }

    invitation.status = 'cancelled';
    await invitation.save();

    await logAction(req.user._id, 'CANCEL_INVITE', 'StaffInvitation', invitation._id, null, null, req);

    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Validate token (public)
// @route   GET /api/public/admin/invites/:token
const validateInviteToken = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const invitation = await StaffInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation link' });
    }

    res.json({ 
      valid: true, 
      email: invitation.email,
      role: invitation.role 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept invitation and create user (public)
// @route   POST /api/public/admin/invites/accept
const acceptInvitation = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const invitation = await StaffInvitation.findOne({
      tokenHash,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation link' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      invitation.status = 'cancelled';
      await invitation.save();
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Create user
    const newUser = await User.create({
      name,
      email: invitation.email,
      password,
      isAdmin: true,
      role: invitation.role,
      permissions: invitation.permissions
    });

    // Mark invite as accepted
    invitation.status = 'accepted';
    await invitation.save();

    await logAction(newUser._id, 'ACCEPT_INVITE', 'User', newUser._id, null, null, req);

    res.status(201).json({ message: 'Account created successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getInvitations,
  resendInvitation,
  cancelInvitation,
  validateInviteToken,
  acceptInvitation,
  sendInviteEmail
};
