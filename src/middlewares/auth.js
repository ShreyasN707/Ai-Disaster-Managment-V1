const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config');

const ROLES = {
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
  PUBLIC: 'PUBLIC',
};

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return next(new ApiError(401, 'Authentication required'));

  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return next(new ApiError(401, 'Token expired'));
    return next(new ApiError(401, 'Invalid token'));
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles, ROLES };
