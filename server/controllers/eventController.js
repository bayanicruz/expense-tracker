// server/controllers/eventController.js
const { Event, ExpenseItem, User } = require('../models');

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('participants', 'name email')
      .sort({ eventDate: -1 }); // Most recent first

    // Calculate total for each event
    const eventsWithTotals = await Promise.all(
      events.map(async (event) => {
        const items = await ExpenseItem.find({ eventId: event._id });
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        
        return {
          ...event.toObject(),
          totalAmount,
          itemCount: items.length
        };
      })
    );

    res.json(eventsWithTotals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, eventDate, participants } = req.body;

    // Basic validation
    if (!title || !eventDate || !participants || participants.length === 0) {
      return res.status(400).json({ 
        error: 'Title, event date, and at least one participant are required' 
      });
    }

    // Verify all participants exist
    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }

    const event = new Event({
      title,
      eventDate,
      participants
    });

    await event.save();
    await event.populate('participants', 'name email');

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/events/:id/items
const getEventItems = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await ExpenseItem.find({ eventId: id }).sort({ createdAt: 1 });
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      items,
      totalAmount,
      itemCount: items.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/events/:id/items
const addEventItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, amount } = req.body;

    // Basic validation
    if (!itemName || !amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Item name and positive amount are required' 
      });
    }

    // Verify event exists
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const expenseItem = new ExpenseItem({
      eventId: id,
      itemName,
      amount
    });

    await expenseItem.save();

    res.status(201).json(expenseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  updateEvent,
  getEventItems,
  addEventItem
};