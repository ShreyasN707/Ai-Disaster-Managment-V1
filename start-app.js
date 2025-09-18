// Simple starter script for the AI Disaster Management System
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_disaster_mgmt?directConnection=true';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import models after DB connection
    require('./src/models/User');
    require('./src/models/Alert');
    require('./src/models/Incident');
    require('./src/models/Subscription');
    
    // Import routes after models are loaded
    const routes = require('./src/routes');
    app.use('/api', routes);
    
    // Serve frontend for all other routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    });
    
    // Start server
    const server = http.createServer(app);
    
    // Initialize Socket.IO if needed
    try {
      const { initSocket } = require('./src/services/socketService');
      initSocket(server);
      console.log('✅ WebSocket service initialized');
    } catch (socketError) {
      console.warn('⚠️  WebSocket service not available:', socketError.message);
    }
    
    server.listen(PORT, () => {
      console.log(`\n🚀 AI Disaster Management System`);
      console.log(`===============================`);
      console.log(`🌐 Frontend:    http://localhost:${PORT}`);
      console.log(`🔗 API:         http://localhost:${PORT}/api`);
      console.log(`🤖 ML Dashboard: http://localhost:${PORT}/ml`);
      console.log(`📊 Health:      http://localhost:${PORT}/health`);
      console.log(`\n📝 Default Admin Login:`);
      console.log(`   Email: admin@disaster.com`);
      console.log(`   Pass:  admin123`);
      console.log(`\n🚀 System is running with full features!`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

// Start the application
connectDB();

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
