#!/usr/bin/env node

// ⚠️  DEPRECATED: Standalone ML Server
// 🔄 ML functionality has been integrated into the main backend
// 🚀 Use: npm start (to run the unified server)

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

log('⚠️  DEPRECATED: Standalone ML Server', colors.yellow + colors.bright);
log('=' .repeat(60), colors.yellow);
log('', colors.reset);
log('🔄 The ML functionality has been integrated into the main backend server.', colors.cyan);
log('', colors.reset);
log('✅ To start the unified AI Disaster Management System:', colors.green);
log('   npm start', colors.green + colors.bright);
log('', colors.reset);
log('🌐 The system will be available at:', colors.blue);
log('   Frontend + Backend: http://localhost:4000', colors.blue);
log('   ML Endpoints: http://localhost:4000/api/ml/*', colors.blue);
log('', colors.reset);
log('📚 For deployment instructions, see:', colors.cyan);
log('   README.md', colors.cyan);
log('   DEPLOYMENT.md', colors.cyan);
log('', colors.reset);
log('🐳 For Docker deployment:', colors.green);
log('   npm run docker:run', colors.green + colors.bright);
log('', colors.reset);

// Exit to prevent running the old server
process.exit(1);
