const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { initSocket } = require('./services/socketService');

async function start() {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available
    try {
      const connectDB = require('./config/db');
      await connectDB();
      logger.info('MongoDB connected successfully');
    } catch (dbError) {
      logger.warn('MongoDB connection failed, running without database:', dbError.message);
      logger.info('Some features may not work without database connection');
    }

    const server = http.createServer(app);
    initSocket(server);

    server.listen(config.port, () => {
      logger.info(`🚀 AI Disaster Management System running on http://localhost:${config.port}`);
      logger.info(`📱 Frontend: http://localhost:${config.port}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api`);
      logger.info(`🤖 ML Dashboard: http://localhost:${config.port}/ml`);
      logger.info(`❤️  Health Check: http://localhost:${config.port}/health`);
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
