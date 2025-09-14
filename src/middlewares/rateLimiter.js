// Import rate limiting middleware
const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API routes
 * - Allows 120 requests per minute per IP
 * - Uses standard rate limit headers
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 120,             // Max requests per window
  standardHeaders: true, // Send standard rate limit headers
  legacyHeaders: false,  // Disable legacy rate limit headers
});

/**
 * Stricter rate limiter for authentication routes
 * - Allows only 20 login attempts per 15 minutes per IP
 * - Helps prevent brute force attacks on login endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 20,                  // Max 20 login attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,    // Send standard rate limit headers
  legacyHeaders: false,     // Disable legacy rate limit headers
});

// Export both rate limiters for use in routes
module.exports = { 
  generalLimiter, // For general API routes
  authLimiter     // For authentication routes 
};
