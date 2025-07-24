// server/controllers/userController.js
const { User, Event, ExpenseItem } = require('../models');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash'); // Exclude password hash
    
    // Calculate running balance for each user
    const usersWithBalance = await Promise.all(
      users.map(async (user) => {
        // Find all events where user is a participant BUT NOT the owner
        const events = await Event.find({
          'participants.user': user._id,
          owner: { $ne: user._id }  // Exclude events owned by this user
        }).populate('participants.user', 'name');

        let totalOwed = 0;
        let totalOwedToUser = 0;

        for (const event of events) {
          // Get expense items for this event
          const expenseItems = await ExpenseItem.find({ eventId: event._id });
          const eventTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
          
          // Find user's participation info
          const userParticipation = event.participants.find(p => p.user._id.toString() === user._id.toString());
          const participantCount = event.participants.length;
          const userShare = participantCount > 0 ? eventTotal / participantCount : 0;
          const amountPaid = userParticipation ? userParticipation.amountPaid || 0 : 0;
          const amountOwed = Math.max(0, userShare - amountPaid);
          
          totalOwed += amountOwed;
        }

        // Calculate amount owed to user from events they own
        const ownedEvents = await Event.find({ owner: user._id });
        for (const event of ownedEvents) {
          const expenseItems = await ExpenseItem.find({ eventId: event._id });
          const eventTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
          const totalAmountPaid = event.participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
          const remainingBalance = Math.max(0, eventTotal - totalAmountPaid);
          totalOwedToUser += remainingBalance;
        }

        return {
          ...user.toObject(),
          runningBalance: totalOwed,
          amountOwedToUser: totalOwedToUser
        };
      })
    );

    res.json(usersWithBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, '-passwordHash'); // Exclude password hash
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // For now, create with a placeholder password hash
    // In future: hash actual password
    const user = new User({
      name,
      passwordHash: 'placeholder-will-add-auth-later',
      role: role || 'user'
    });

    await user.save();

    // Return user without password hash
    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.passwordHash;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/users/:id/expenses
const getUserExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user exists
    const user = await User.findById(id, '-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find all events where user is a participant BUT NOT the owner
    const participatedEvents = await Event.find({
      'participants.user': id,
      owner: { $ne: id }  // Exclude events owned by this user
    }).populate([
      { path: 'owner', select: 'name' },
      { path: 'participants.user', select: 'name' }
    ]);

    const ownedEvents = await Event.find({
      owner: id
    }).populate([
      { path: 'owner', select: 'name' },
      { path: 'participants.user', select: 'name' }
    ]);

    let totalOwed = 0;
    const eventBreakdown = [];

    // Process participated events (where user owes money)
    for (const event of participatedEvents) {
      // Get expense items for this event
      const expenseItems = await ExpenseItem.find({ eventId: event._id });
      const eventTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
      
      // Find user's participation info
      const userParticipation = event.participants.find(p => p.user._id.toString() === id);
      const participantCount = event.participants.length;
      const userShare = participantCount > 0 ? eventTotal / participantCount : 0;
      const amountPaid = userParticipation ? userParticipation.amountPaid || 0 : 0;
      const amountOwed = Math.max(0, userShare - amountPaid);
      
      // Add to totalOwed since we've already excluded owned events in the query
      totalOwed += amountOwed;

      // Calculate additional fields for owner view
      const splitPerPerson = participantCount > 0 ? eventTotal / participantCount : 0;
      const totalAmountPaid = event.participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const remainingBalance = Math.max(0, eventTotal - totalAmountPaid);

      eventBreakdown.push({
        eventId: event._id,
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventOwner: event.owner ? {
          _id: event.owner._id,
          name: event.owner.name
        } : null,
        eventTotal: eventTotal,
        participantCount: participantCount,
        userShare: userShare,
        amountPaid: amountPaid,
        amountOwed: amountOwed,
        // Additional fields for owner display
        splitPerPerson: splitPerPerson,
        totalAmountPaid: totalAmountPaid,
        remainingBalance: remainingBalance,
        expenseItems: expenseItems.map(item => ({
          itemName: item.itemName,
          amount: item.amount
        }))
      });
    }

    // Process owned events (where user is owed money)
    for (const event of ownedEvents) {
      // Check if user is already included as participant 
      const isAlsoParticipant = event.participants.some(p => p.user._id.toString() === id);
      
      // Get expense items for this event
      const expenseItems = await ExpenseItem.find({ eventId: event._id });
      const eventTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
      
      const participantCount = event.participants.length;
      const splitPerPerson = participantCount > 0 ? eventTotal / participantCount : 0;
      
      // Calculate total amount paid by all participants
      const totalAmountPaid = event.participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      const remainingBalance = Math.max(0, eventTotal - totalAmountPaid);

      if (isAlsoParticipant) {
        // Owner is also a participant - get their participation data
        const userParticipation = event.participants.find(p => p.user._id.toString() === id);
        const userShare = participantCount > 0 ? eventTotal / participantCount : 0;
        const amountPaid = userParticipation ? userParticipation.amountPaid || 0 : 0;
        const amountOwed = Math.max(0, userShare - amountPaid);
        
        eventBreakdown.push({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventOwner: {
            _id: event.owner._id,
            name: event.owner.name
          },
          eventTotal: eventTotal,
          participantCount: participantCount,
          userShare: userShare, // Owner's share as participant
          amountPaid: amountPaid, // Owner's payment as participant
          amountOwed: amountOwed, // Owner's debt as participant
          splitPerPerson: splitPerPerson,
          totalAmountPaid: totalAmountPaid,
          remainingBalance: remainingBalance,
          expenseItems: expenseItems.map(item => ({
            itemName: item.itemName,
            amount: item.amount
          }))
        });
      } else {
        // Owner is not a participant - they don't owe anything
        eventBreakdown.push({
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventOwner: {
            _id: event.owner._id,
            name: event.owner.name
          },
          eventTotal: eventTotal,
          participantCount: participantCount,
          userShare: 0, // Owner doesn't owe money in owner-only events
          amountPaid: 0, // Owner doesn't pay in owner-only events
          amountOwed: 0, // Owner doesn't owe in owner-only events
          splitPerPerson: splitPerPerson,
          totalAmountPaid: totalAmountPaid,
          remainingBalance: remainingBalance,
          expenseItems: expenseItems.map(item => ({
            itemName: item.itemName,
            amount: item.amount
          }))
        });
      }
    }

    const participatedEventCount = participatedEvents.length;

    res.json({
      user: user,
      totalOwed: totalOwed,
      eventCount: participatedEventCount,
      eventBreakdown: eventBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserExpenses
};