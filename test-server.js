// Simple test server to identify the issue
const express = require('express');
const path = require('path');

console.log('Starting simple test server...');

const app = express();
const PORT = 4000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Disaster Management System is running' });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
});
