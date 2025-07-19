// server/controllers/analyticsController.js
const { User, Event, ExpenseItem } = require('../models');
const mongoose = require('mongoose');

// GET /api/analytics
const getAnalytics = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection stats for each collection (with error handling)
    let userStats = { storageSize: 0, totalIndexSize: 0, avgObjSize: 0 };
    let eventStats = { storageSize: 0, totalIndexSize: 0, avgObjSize: 0 };
    let expenseItemStats = { storageSize: 0, totalIndexSize: 0, avgObjSize: 0 };
    
    try {
      userStats = await db.collection('users').stats();
    } catch (e) {
      console.log('Users collection stats not available:', e.message);
    }
    
    try {
      eventStats = await db.collection('events').stats();
    } catch (e) {
      console.log('Events collection stats not available:', e.message);
    }
    
    try {
      expenseItemStats = await db.collection('expenseitems').stats();
    } catch (e) {
      console.log('ExpenseItems collection stats not available:', e.message);
    }
    
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const expenseItemCount = await ExpenseItem.countDocuments();
    
    // Calculate total storage used (in bytes)
    const totalStorageBytes = dbStats.dataSize + dbStats.indexSize;
    const totalStorageMB = totalStorageBytes / (1024 * 1024);
    const totalStorageGB = totalStorageMB / 1024;
    
    // MongoDB Atlas Free Tier limits
    const FREE_TIER_LIMIT_GB = 0.5; // 512 MB
    const FREE_TIER_LIMIT_BYTES = FREE_TIER_LIMIT_GB * 1024 * 1024 * 1024;
    
    // Calculate usage percentage
    const usagePercentage = (totalStorageBytes / FREE_TIER_LIMIT_BYTES) * 100;
    
    // Collection breakdown
    const collections = [
      {
        name: 'Users',
        collection: 'users',
        documentCount: userCount,
        storageSize: userStats.storageSize || 0,
        indexSize: userStats.totalIndexSize || 0,
        avgDocSize: userStats.avgObjSize || 0
      },
      {
        name: 'Events',
        collection: 'events',
        documentCount: eventCount,
        storageSize: eventStats.storageSize || 0,
        indexSize: eventStats.totalIndexSize || 0,
        avgDocSize: eventStats.avgObjSize || 0
      },
      {
        name: 'Expense Items',
        collection: 'expenseitems',
        documentCount: expenseItemCount,
        storageSize: expenseItemStats.storageSize || 0,
        indexSize: expenseItemStats.totalIndexSize || 0,
        avgDocSize: expenseItemStats.avgObjSize || 0
      }
    ];
    
    // Calculate totals
    const totalDocuments = userCount + eventCount + expenseItemCount;
    
    res.json({
      database: {
        name: db.databaseName,
        totalDocuments,
        totalCollections: collections.length
      },
      storage: {
        used: {
          bytes: totalStorageBytes,
          mb: Math.round(totalStorageMB * 100) / 100,
          gb: Math.round(totalStorageGB * 1000) / 1000
        },
        limit: {
          bytes: FREE_TIER_LIMIT_BYTES,
          mb: FREE_TIER_LIMIT_GB * 1024,
          gb: FREE_TIER_LIMIT_GB
        },
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        remaining: {
          bytes: Math.max(0, FREE_TIER_LIMIT_BYTES - totalStorageBytes),
          mb: Math.max(0, Math.round((FREE_TIER_LIMIT_GB * 1024 - totalStorageMB) * 100) / 100),
          gb: Math.max(0, Math.round((FREE_TIER_LIMIT_GB - totalStorageGB) * 1000) / 1000)
        }
      },
      breakdown: {
        dataSize: dbStats.dataSize,
        indexSize: dbStats.indexSize,
        collections
      },
      performance: {
        avgDocumentSize: Math.round((totalStorageBytes / totalDocuments) * 100) / 100 || 0,
        indexToDataRatio: totalStorageBytes > 0 ? Math.round((dbStats.indexSize / dbStats.dataSize) * 10000) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    });
  }
};

module.exports = {
  getAnalytics
};