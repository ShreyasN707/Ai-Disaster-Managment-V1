// Simple starter for the AI Disaster Management System
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Configuration
const PORT = 4000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/ai_disaster_mgmt?directConnection=true';

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Disaster Management System is running' });
});

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 AI Disaster Management System`);
      console.log(`===============================`);
      console.log(`🌐 Frontend:    http://localhost:${PORT}`);
      console.log(`🔗 API Test:    http://localhost:${PORT}/api/test`);
      console.log(`📊 Health:      http://localhost:${PORT}/health`);
      console.log(`\n🚀 System is running in simple mode`);
    });
    
    // Handle shutdown gracefully
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

// Start the application
start();
