// server/routes/events.js
const express = require('express');
const {
  validateCreateEvent,
  validateUpdateEvent,
  validateEventId,
  validateAddEventItem,
  validateUpdatePayment,
} = require('../middleware/validate');
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
router.get('/:id', validateEventId, getEventById);
router.post('/', validateCreateEvent, createEvent);
router.put('/:id', validateUpdateEvent, updateEvent);
router.patch('/:id', validateUpdateEvent, updateEvent);
router.delete('/:id', validateEventId, deleteEvent);

// Expense item routes (nested under events)
router.get('/:id/items', validateEventId, getEventItems);
router.post('/:id/items', validateAddEventItem, addEventItem);

// Payment amount routes
router.patch('/:id/participants/:participantId/payment', validateUpdatePayment, updateParticipantPaymentAmount);

module.exports = router;