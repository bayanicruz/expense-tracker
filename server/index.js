require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Placeholder route
app.get('/api/expenses', (req, res) => {
  res.json({ message: 'Expense list will go here' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});