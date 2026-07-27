const User = require('../models/User');
const AdminSession = require('../models/AdminSession');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const JWT_SECRET = process.env.JWT_SECRET || 'vancy_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'vancy_refresh_secret';

// Helper to generate access token
const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
};

// Helper to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
};

// @desc    Admin login step 1 (verifies credentials, requests 2FA)
// @route   POST /api/admin/auth/login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.role === 'customer') {
      return res.status(401).json({ message: 'Invalid credentials or unauthorized role' });
    }

    if (await user.matchPassword(password)) {
      // If 2FA not enabled, generate a setup secret
      if (!user.twoFactorEnabled) {
        const secret = speakeasy.generateSecret({ name: `Vancy Admin (${email})` });
        user.twoFactorSecret = secret.base32;
        await user.save();
        
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
          if (err) return res.status(500).json({ message: 'Error generating QR code' });
          return res.json({ 
            message: '2FA setup required',
            setupRequired: true,
            qrCode: data_url,
            userId: user._id
          });
        });
      } else {
        // 2FA is enabled, just ask for the token
        res.json({
          message: '2FA verification required',
          setupRequired: false,
          userId: user._id
        });
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin login step 2 (verifies 2FA, issues tokens)
// @route   POST /api/admin/auth/verify-2fa
const verify2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (verified) {
      if (!user.twoFactorEnabled) {
        user.twoFactorEnabled = true;
        await user.save();
      }

      const accessToken = generateAccessToken(user._id, user.role);
      const refreshToken = generateRefreshToken(user._id);

      // Create admin session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await AdminSession.create({
        adminId: user._id,
        refreshToken,
        deviceInfo: req.headers['user-agent'] || 'Unknown Device',
        ipAddress: req.ip || req.connection.remoteAddress,
        expiresAt
      });

      res.cookie('admin_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken
      });
    } else {
      res.status(401).json({ message: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/admin/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.admin_refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const session = await AdminSession.findOne({ refreshToken: token });
    if (!session) return res.status(401).json({ message: 'Session expired or invalid' });

    jwt.verify(token, REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const user = await User.findById(decoded.userId);
      if (!user) return res.status(404).json({ message: 'User no longer exists' });

      session.lastActive = new Date();
      await session.save();

      const newAccessToken = generateAccessToken(user._id, user.role);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout and clear session
// @route   POST /api/admin/auth/logout
const adminLogout = async (req, res) => {
  try {
    const token = req.cookies.admin_refresh_token;
    if (token) {
      await AdminSession.deleteOne({ refreshToken: token });
    }
    res.cookie('admin_refresh_token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { adminLogin, verify2FA, refreshToken, adminLogout };
