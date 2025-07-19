// server/controllers/userController.js
const { User } = require('../models');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash'); // Exclude password hash
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // For now, create with a placeholder password hash
    // In future: hash actual password
    const user = new User({
      name,
      email,
      passwordHash: 'placeholder-will-add-auth-later',
      role: role || 'user'
    });

    await user.save();

    // Return user without password hash
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUser
};