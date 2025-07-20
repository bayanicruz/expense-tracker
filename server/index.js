require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const expenseItemRoutes = require('./routes/expense-items');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['https://bayanicruz.github.io', 'http://localhost:3000'],
  credentials: true
})); // Enable CORS for frontend
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DATABASE
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas!');
  console.log('Database name:', mongoose.connection.db.databaseName);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/expense-items', expenseItemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Expense Tracker API is running!',
    database: mongoose.connection.db.databaseName,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;