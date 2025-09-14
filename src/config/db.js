const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./index');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongoUri, {
      autoIndex: true,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error: %s', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
