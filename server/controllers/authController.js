const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const NGOProfile = require('../models/NGOProfile');
const DriverProfile = require('../models/DriverProfile');
const { ROLES } = require('../config/constants');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'surplus_to_shelter_super_secret_jwt_key_2024', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register a new user and role profile
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      organizationName,
      businessType,
      address,
      latitude,
      longitude,
      capacity,
      foodPreferences,
      vehicleType,
      vehicleNumber
    } = req.body;

    // Check existing email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      location: {
        address: address || 'Ajmer, Rajasthan',
        latitude: Number(latitude) || 26.4499,
        longitude: Number(longitude) || 74.6399
      }
    });

    let profile = null;

    if (role === ROLES.DONOR) {
      profile = await DonorProfile.create({
        userId: user._id,
        organizationName: organizationName || name,
        businessType: businessType || 'Restaurant',
        address: address || 'Ajmer, Rajasthan',
        latitude: Number(latitude) || 26.4499,
        longitude: Number(longitude) || 74.6399,
        contactPerson: name
      });
    } else if (role === ROLES.NGO) {
      const cap = Number(capacity) || 100;
      profile = await NGOProfile.create({
        userId: user._id,
        organizationName: organizationName || name,
        address: address || 'Ajmer, Rajasthan',
        latitude: Number(latitude) || 26.4520,
        longitude: Number(longitude) || 74.6360,
        capacity: cap,
        availableCapacity: cap,
        foodPreferences: foodPreferences || ['Cooked Food', 'Packaged Food'],
        contactPerson: name
      });
    } else if (role === ROLES.DRIVER) {
      profile = await DriverProfile.create({
        userId: user._id,
        vehicleType: vehicleType || 'Two-Wheeler (Bike/Scooter)',
        vehicleNumber: vehicleNumber || 'RJ-01-AB-1234',
        currentLocation: {
          latitude: Number(latitude) || 26.4499,
          longitude: Number(longitude) || 74.6399
        }
      });
    }

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login existing user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Fetch profile
    let profile = null;
    if (user.role === ROLES.DONOR) {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.NGO) {
      profile = await NGOProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.DRIVER) {
      profile = await DriverProfile.findOne({ userId: user._id });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === ROLES.DONOR) {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.NGO) {
      profile = await NGOProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.DRIVER) {
      profile = await DriverProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Quick switch demo login helper
 */
const demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;
    let user = await User.findOne({ role: role.toUpperCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: `No demo account found for role ${role}.` });
    }

    let profile = null;
    if (user.role === ROLES.DONOR) {
      profile = await DonorProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.NGO) {
      profile = await NGOProfile.findOne({ userId: user._id });
    } else if (user.role === ROLES.DRIVER) {
      profile = await DriverProfile.findOne({ userId: user._id });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin
};
