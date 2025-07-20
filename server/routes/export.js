// server/routes/export.js
const express = require('express');
const { exportDataToCsv } = require('../controllers/exportController');

const router = express.Router();

// GET /api/export/csv - Export all data to CSV
router.get('/csv', exportDataToCsv);

module.exports = router;