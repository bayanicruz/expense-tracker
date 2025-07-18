// server/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  settled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual to calculate total amount from expense items
eventSchema.virtual('totalAmount', {
  ref: 'ExpenseItem',
  localField: '_id',
  foreignField: 'eventId'
});

// Ensure virtuals are included in JSON output
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);