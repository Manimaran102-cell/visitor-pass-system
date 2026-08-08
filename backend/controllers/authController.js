const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = {
  'admin@company.com': { password: 'Admin@123', role: 'admin', name: 'Alice Admin' },
  'receptionist@company.com': { password: 'Reception@123', role: 'receptionist', name: 'Rita Receptionist' },
  'john.employee@company.com': { password: 'Employee@123', role: 'employee', name: 'John Employee' },
};

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const demoUser = demoUsers[normalizedEmail];

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: normalizedEmail }).select('+password');
      } catch (dbErr) {
        console.warn('DB lookup failed during login:', dbErr.message);
        return res.status(503).json({ message: 'Authentication service is temporarily unavailable' });
      }
    }

    if (user) {
      if (!user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user);
      return res.json({ token, user: user.toSafeObject() });
    }

    if (demoUser && password === demoUser.password) {
      const token = signToken({ _id: normalizedEmail, role: demoUser.role });
      return res.json({
        token,
        user: {
          id: normalizedEmail,
          name: demoUser.name,
          email: normalizedEmail,
          role: demoUser.role,
          isActive: true,
        },
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Authentication service is temporarily unavailable' });
    }

    return res.status(401).json({ message: 'Invalid credentials' });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

module.exports = { login, getMe };
