// server/routes/users.js
const express = require('express');
const {
  validateCreateUser,
  validateUpdateUser,
  validateUserId,
  validateUserSearch,
} = require('../middleware/validate');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserExpenses 
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users - Get all users (with optional ?search=)
router.get('/', validateUserSearch, getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', validateUserId, getUserById);

// GET /api/users/:id/expenses - Get user's expense summary
router.get('/:id/expenses', validateUserId, getUserExpenses);

// POST /api/users - Create new user
router.post('/', validateCreateUser, createUser);

// PATCH /api/users/:id - Update user
router.patch('/:id', validateUpdateUser, updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', validateUserId, deleteUser);

module.exports = router;