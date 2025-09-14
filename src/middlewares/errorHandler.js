const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const isOperational = !!err.statusCode;

  logger.error('Error %d: %s', status, message, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation error', details: err.message });
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' && !isOperational ? { stack: err.stack } : {}) });
};
