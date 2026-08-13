const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password });

    if (user) {
      // Create Welcome Notification
      await Notification.create({
        user: user._id,
        title: 'Welcome to Vancy Legacy!',
        message: 'Thank you for joining. Use code WELCOME-10 for 10% off your first order!',
        type: 'welcome',
        actionUrl: '/shop'
      });

      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        savedAddresses: user.savedAddresses,
        wishlist: user.wishlist
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country
    };

    user.savedAddresses.push(newAddress);
    await user.save();

    res.status(201).json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.savedAddresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    address.street = req.body.street || address.street;
    address.city = req.body.city || address.city;
    address.state = req.body.state || address.state;
    address.postalCode = req.body.postalCode || address.postalCode;
    address.country = req.body.country || address.country;

    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
const removeAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedAddresses.pull({ _id: req.params.id });
    await user.save();

    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request data export or deletion (DPDP)
// @route   POST /api/auth/profile/dpdp-request
// @access  Private
const requestDataExportDelete = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { type, notes } = req.body;
    
    // In a real system, this would queue a job, send an email to DPO, or flag the user record
    console.log(`[DPDP REQUEST] User ${user.email} requested ${type}. Notes: ${notes}`);

    res.status(200).json({ message: 'Your request has been submitted and will be processed within 30 days.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, addAddress, updateAddress, removeAddress, requestDataExportDelete };
