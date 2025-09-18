const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const rateLimiter = require('./middlewares/rateLimiter');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ 
  origin: config.cors.origins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitization
app.use(xss());
app.use(mongoSanitize());

// Rate limit
app.use('/api', rateLimiter.generalLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadsDir)));

// Serve frontend build files in production
if (config.env === 'production') {
  app.use(express.static(path.join(process.cwd(), config.frontend.buildDir)));
} else {
  // Static public demo frontend for development
  app.use(express.static(path.join(__dirname, 'public')));
}

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', env: config.env }));

// API routes
app.use('/api', routes);

// Serve frontend SPA in production (catch-all route)
if (config.env === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), config.frontend.buildDir, 'index.html'));
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;
