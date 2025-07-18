// server/models/ExpenseItem.js
const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExpenseItem', expenseItemSchema);