// server/routes/events.js
const express = require('express');
const { 
  getAllEvents, 
  createEvent, 
  updateEvent,
  getEventItems,
  addEventItem 
} = require('../controllers/eventController');

const router = express.Router();

// Event routes
router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);

// Expense item routes (nested under events)
router.get('/:id/items', getEventItems);
router.post('/:id/items', addEventItem);

module.exports = router;