const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper functions for environment variables
const getEnv = (key, defaultValue) => {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

const getBooleanEnv = (key, defaultValue = false) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
};

const getNumberEnv = (key, defaultValue) => {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  origin: process.env.ORIGIN || 'http://localhost:3000',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ai_disaster_mgmt',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  adminRegistrationCode: process.env.ADMIN_REGISTRATION_CODE || 'change_me',
  logLevel: process.env.LOG_LEVEL || 'info',
  uploadsDir: process.env.UPLOAD_DIR || 'uploads',
  ML_SERVICE: {
    ENABLED: getBooleanEnv('ML_SERVICE_ENABLED', true),
    USE_MOCK_MODEL: true, // Force mock model
    MODEL_PATH: getEnv('ML_MODEL_PATH', path.join(__dirname, '../../tfjs_model')),
    IMAGE_SIZE: getNumberEnv('ML_IMAGE_SIZE', 128),
    PREDICTION_THRESHOLD: getNumberEnv('ML_PREDICTION_THRESHOLD', 0.5),
    CACHE_TTL: getNumberEnv('ML_CACHE_TTL', 3600), // 1 hour
    MAX_IMAGE_SIZE: getNumberEnv('ML_MAX_IMAGE_SIZE', 10 * 1024 * 1024), // 10MB
    SUPPORTED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ]
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    buildDir: process.env.FRONTEND_BUILD_DIR || './frontend/dist',
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:4000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

module.exports = config;
