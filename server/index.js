require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { User, Event, ExpenseItem } = require('./models'); // Import models

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'expense_tracker_dev'
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas!');
});

// Test route with models
app.get('/api/test', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const expenseCount = await ExpenseItem.countDocuments();
    
    res.json({ 
      message: 'Server is running!',
      database: {
        users: userCount,
        events: eventCount,
        expenseItems: expenseCount,
        database: mongoose.connection.db.databaseName, 
      },
      timestamp: new Date() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});