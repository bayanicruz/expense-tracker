// server/controllers/exportController.js
const { User, Event, ExpenseItem } = require('../models');

// GET /api/export/csv
const exportDataToCsv = async (req, res) => {
  try {
    // Fetch all data
    const users = await User.find({}, '-passwordHash');
    const events = await Event.find()
      .populate([
        { path: 'owner', select: 'name' },
        { path: 'participants.user', select: 'name' }
      ]);
    const expenseItems = await ExpenseItem.find();

    // Prepare CSV data structures
    const csvData = {
      users: [],
      events: [],
      expenseItems: [],
      participantDetails: []
    };

    // Process Users
    users.forEach(user => {
      csvData.users.push({
        'User ID': user._id,
        'Name': user.name,
        'Role': user.role,
        'Created At': user.createdAt ? new Date(user.createdAt).toISOString() : '',
        'Updated At': user.updatedAt ? new Date(user.updatedAt).toISOString() : ''
      });
    });

    // Process Events and Participants
    for (const event of events) {
      // Calculate event totals
      const eventExpenseItems = expenseItems.filter(item => 
        item.eventId.toString() === event._id.toString()
      );
      const eventTotal = eventExpenseItems.reduce((sum, item) => sum + item.amount, 0);
      const participantCount = event.participants.length;
      const perPersonAmount = participantCount > 0 ? eventTotal / participantCount : 0;

      csvData.events.push({
        'Event ID': event._id,
        'Title': event.title,
        'Event Date': new Date(event.eventDate).toISOString().split('T')[0],
        'Owner ID': event.owner ? event.owner._id : '',
        'Owner Name': event.owner ? event.owner.name : '',
        'Total Amount': eventTotal.toFixed(2),
        'Participant Count': participantCount,
        'Amount Per Person': perPersonAmount.toFixed(2),
        'Expense Items Count': eventExpenseItems.length,
        'Settled': event.settled || false,
        'Created At': event.createdAt ? new Date(event.createdAt).toISOString() : '',
        'Updated At': event.updatedAt ? new Date(event.updatedAt).toISOString() : ''
      });

      // Process Participants for this event
      event.participants.forEach(participant => {
        const userShare = perPersonAmount;
        const amountPaid = participant.amountPaid || 0;
        const amountOwed = Math.max(0, userShare - amountPaid);

        csvData.participantDetails.push({
          'Event ID': event._id,
          'Event Title': event.title,
          'Event Date': new Date(event.eventDate).toISOString().split('T')[0],
          'User ID': participant.user._id,
          'User Name': participant.user.name,
          'User Share': userShare.toFixed(2),
          'Amount Paid': amountPaid.toFixed(2),
          'Amount Owed': amountOwed.toFixed(2),
          'Payment Status': amountOwed > 0 ? 'Partial' : amountPaid > 0 ? 'Paid' : 'Unpaid'
        });
      });
    }

    // Process Expense Items
    expenseItems.forEach(item => {
      const relatedEvent = events.find(e => e._id.toString() === item.eventId.toString());
      
      csvData.expenseItems.push({
        'Expense Item ID': item._id,
        'Event ID': item.eventId,
        'Event Title': relatedEvent ? relatedEvent.title : '',
        'Event Date': relatedEvent ? new Date(relatedEvent.eventDate).toISOString().split('T')[0] : '',
        'Item Name': item.itemName,
        'Amount': item.amount.toFixed(2),
        'Created At': item.createdAt ? new Date(item.createdAt).toISOString() : '',
        'Updated At': item.updatedAt ? new Date(item.updatedAt).toISOString() : ''
      });
    });

    // Convert to CSV format
    const convertToCSV = (data, title) => {
      if (data.length === 0) return `\n${title}\nNo data available\n\n`;
      
      const headers = Object.keys(data[0]);
      const csvRows = [
        `\n${title}`,
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma or quote
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ),
        '' // Empty line after each section
      ];
      
      return csvRows.join('\n');
    };

    // Generate complete CSV
    const csvContent = [
      'Expense Tracker Data Export',
      `Generated on: ${new Date().toISOString()}`,
      `Total Users: ${csvData.users.length}`,
      `Total Events: ${csvData.events.length}`,
      `Total Expense Items: ${csvData.expenseItems.length}`,
      `Total Participant Records: ${csvData.participantDetails.length}`,
      '',
      convertToCSV(csvData.users, 'USERS'),
      convertToCSV(csvData.events, 'EVENTS'),
      convertToCSV(csvData.expenseItems, 'EXPENSE ITEMS'),
      convertToCSV(csvData.participantDetails, 'PARTICIPANT DETAILS')
    ].join('\n');

    // Set response headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `expense-tracker-export-${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: 'Failed to export data',
      details: error.message 
    });
  }
};

module.exports = {
  exportDataToCsv
};