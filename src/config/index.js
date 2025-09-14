const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  origin: process.env.ORIGIN || 'http://localhost:4000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai_disaster_mgmt',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  adminRegistrationCode: process.env.ADMIN_REGISTRATION_CODE || 'change_me',
  logLevel: process.env.LOG_LEVEL || 'info',
  uploadsDir: process.env.UPLOAD_DIR || 'uploads',
};

module.exports = config;
