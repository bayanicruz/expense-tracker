// server/routes/events.js
const express = require('express');
const { 
  getAllEvents, 
  getEventById,
  createEvent, 
  updateEvent,
  deleteEvent,
  getEventItems,
  addEventItem,
  updateParticipantPaymentAmount
} = require('../controllers/eventController');

const router = express.Router();

// Event routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.patch('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// Expense item routes (nested under events)
router.get('/:id/items', getEventItems);
router.post('/:id/items', addEventItem);

// Payment amount routes
router.patch('/:id/participants/:participantId/payment', updateParticipantPaymentAmount);

module.exports = router;