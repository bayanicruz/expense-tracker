// server/routes/users.js
const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserExpenses 
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// GET /api/users/:id/expenses - Get user's expense summary
router.get('/:id/expenses', getUserExpenses);

// POST /api/users - Create new user (admin only in future)
router.post('/', createUser);

// PATCH /api/users/:id - Update user
router.patch('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

module.exports = router;