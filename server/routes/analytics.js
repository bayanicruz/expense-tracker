// server/routes/analytics.js
const express = require('express');
const { getAnalytics, purgeAllData } = require('../controllers/analyticsController');
const { validatePurgeAll } = require('../middleware/validate');

const router = express.Router();

// GET /api/analytics - Get database and storage analytics
router.get('/', getAnalytics);

// DELETE /api/analytics/purge-all - Purge all data (admin only)
router.delete('/purge-all', validatePurgeAll, purgeAllData);

module.exports = router;