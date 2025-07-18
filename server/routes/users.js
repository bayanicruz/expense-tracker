// server/routes/users.js
const express = require('express');
const { getAllUsers, createUser } = require('../controllers/userController');

const router = express.Router();

// GET /api/users - Get all users
router.get('/', getAllUsers);

// POST /api/users - Create new user (admin only in future)
router.post('/', createUser);

module.exports = router;