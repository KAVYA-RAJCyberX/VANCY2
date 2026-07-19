const Address = require('../models/Address');

// Get user addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create address
exports.createAddress = async (req, res) => {
  try {
    const { firstName, lastName, email, address, city, postalCode, isDefault } = req.body;

    // If this is the first address or isDefault is true, unset other defaults
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddress = new Address({
      user: req.user._id,
      firstName,
      lastName,
      email,
      address,
      city,
      postalCode,
      isDefault
    });

    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await address.deleteOne();
    res.status(200).json({ message: 'Address removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
