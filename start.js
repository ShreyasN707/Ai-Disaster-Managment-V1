#!/usr/bin/env node

/**
 * Startup script for AI Disaster Management System
 * Ensures proper environment setup and graceful startup
 */

const path = require('path');
const fs = require('fs');

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

console.log('🚀 Starting AI Disaster Management System...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📍 Port: ${process.env.PORT || 10000}`);

// Check for required environment variables in production
if (isProduction) {
  const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('💡 Please set these variables in your deployment platform');
    process.exit(1);
  }
}

// Check if frontend build exists
const frontendBuildPath = path.join(__dirname, 'frontend', 'dist');
if (!fs.existsSync(frontendBuildPath)) {
  console.warn('⚠️  Frontend build not found. Running in API-only mode.');
  console.warn('💡 Run "npm run build" to build the frontend');
}

// Start the main server
console.log('🔄 Loading production server...');
require('./production-server.js');
