// server/routes/analytics.js
const express = require('express');
const { getAnalytics, verifyPurgePassword, purgeAllData } = require('../controllers/analyticsController');
const { validatePurgeAll } = require('../middleware/validate');

const router = express.Router();

// GET /api/analytics - Get database and storage analytics
router.get('/', getAnalytics);

// POST /api/analytics/verify-purge - Verify purge password without purging
router.post('/verify-purge', validatePurgeAll, verifyPurgePassword);

// DELETE /api/analytics/purge-all - Purge all data (admin only)
router.delete('/purge-all', validatePurgeAll, purgeAllData);

module.exports = router;