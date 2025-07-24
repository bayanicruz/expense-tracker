// server/routes/expense-items.js
const express = require('express');
const { ExpenseItem, Event } = require('../models');

const router = express.Router();

// GET /api/expense-items?eventId=:eventId
const getExpenseItems = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ error: 'eventId query parameter is required' });
    }

    const items = await ExpenseItem.find({ eventId }).sort({ createdAt: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/expense-items
const createExpenseItem = async (req, res) => {
  try {
    const { eventId, itemName, amount } = req.body;

    // Basic validation
    if (!eventId || !itemName || !amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'eventId, itemName, and positive amount are required' 
      });
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const expenseItem = new ExpenseItem({
      eventId,
      itemName,
      amount
    });

    await expenseItem.save();
    res.status(201).json(expenseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/expense-items/:id
const updateExpenseItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    // Basic validation
    if (amount === undefined || amount === null) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    if (amount < 0) {
      return res.status(400).json({ error: 'Amount must be non-negative' });
    }

    const expenseItem = await ExpenseItem.findByIdAndUpdate(
      id,
      { amount: parseFloat(amount) },
      { new: true, runValidators: true }
    );
    
    if (!expenseItem) {
      return res.status(404).json({ error: 'Expense item not found' });
    }

    res.json(expenseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/expense-items/:id
const deleteExpenseItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expenseItem = await ExpenseItem.findByIdAndDelete(id);
    
    if (!expenseItem) {
      return res.status(404).json({ error: 'Expense item not found' });
    }

    res.json({ message: 'Expense item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

router.get('/', getExpenseItems);
router.post('/', createExpenseItem);
router.patch('/:id', updateExpenseItem);
router.delete('/:id', deleteExpenseItem);

module.exports = router;