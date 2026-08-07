const User = require('../models/User');
const Employee = require('../models/Employee');

// GET /api/users
const getUsers = async (req, res) => {
  const users = await User.find().populate('employeeProfile', 'name department designation').sort('-createdAt');
  res.json(users.map((u) => u.toSafeObject()));
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, employeeProfile } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }
    if (!['admin', 'receptionist', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }
    if (role === 'employee' && !employeeProfile) {
      return res.status(400).json({ message: 'employeeProfile is required for employee-role accounts' });
    }

    const user = await User.create({ name, email, password, role, employeeProfile: employeeProfile || undefined });

    if (role === 'employee' && employeeProfile) {
      await Employee.findByIdAndUpdate(employeeProfile, { linkedUser: user._id });
    }

    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { name, isActive, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
