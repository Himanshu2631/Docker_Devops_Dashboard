const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to check if DB is connected
const checkDBConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database is not connected. Please check backend logs for connection issues.');
  }
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check DB Connection
    checkDBConnection();

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'operator'
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check DB Connection
    checkDBConnection();

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
