// server/controllers/eventController.js
const { Event, ExpenseItem, User } = require('../models');

// GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate([
        { path: 'owner', select: 'name email' },
        { path: 'participants.user', select: 'name email' }
      ])
      .sort({ eventDate: -1 }); // Most recent first

    // Calculate total and remaining balance for each event
    const eventsWithTotals = await Promise.all(
      events.map(async (event) => {
        const items = await ExpenseItem.find({ eventId: event._id });
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        
        // Calculate remaining balance (total amount - amount paid by participants)
        const participantCount = event.participants.length;
        const perPersonAmount = participantCount > 0 ? totalAmount / participantCount : 0;
        const totalAmountPaid = event.participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const remainingBalance = Math.max(0, totalAmount - totalAmountPaid);
        
        return {
          ...event.toObject(),
          totalAmount,
          itemCount: items.length,
          remainingBalance
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
    const { title, eventDate, owner, participants } = req.body;

    // Basic validation
    if (!title || !eventDate || !owner || !participants || participants.length === 0) {
      return res.status(400).json({ 
        error: 'Title, event date, owner, and at least one participant are required' 
      });
    }

    // Verify owner exists
    const ownerUser = await User.findById(owner);
    if (!ownerUser) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    // Convert participant IDs to the new format with payment amount
    const formattedParticipants = participants.map(participantId => ({
      user: participantId,
      amountPaid: 0
    }));

    // Verify all participants exist
    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }

    const event = new Event({
      title,
      eventDate,
      owner,
      participants: formattedParticipants
    });

    await event.save();
    await event.populate([
      { path: 'owner', select: 'name email' },
      { path: 'participants.user', select: 'name email' }
    ]);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate([
        { path: 'owner', select: 'name email' },
        { path: 'participants.user', select: 'name email' }
      ]);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
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
    ).populate([
      { path: 'owner', select: 'name email' },
      { path: 'participants.user', select: 'name email' }
    ]);

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

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete all expense items for this event first
    await ExpenseItem.deleteMany({ eventId: id });
    
    // Delete the event
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event and associated expense items deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/events/:id/participants/:participantId/payment
const updateParticipantPaymentAmount = async (req, res) => {
  try {
    const { id, participantId } = req.params;
    const { amountPaid } = req.body;
    
    if (typeof amountPaid !== 'number' || amountPaid < 0) {
      return res.status(400).json({ error: 'amountPaid must be a non-negative number' });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Find and update the participant's payment amount
    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === participantId
    );

    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Participant not found in this event' });
    }

    event.participants[participantIndex].amountPaid = amountPaid;
    await event.save();
    await event.populate([
      { path: 'owner', select: 'name email' },
      { path: 'participants.user', select: 'name email' }
    ]);

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventItems,
  addEventItem,
  updateParticipantPaymentAmount
};