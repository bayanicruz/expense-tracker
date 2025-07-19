// server/routes/analytics.js
const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// GET /api/analytics - Get database and storage analytics
router.get('/', getAnalytics);

module.exports = router;