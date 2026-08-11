const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler } = require('./errorHandler');

// Verifies JWT, attaches req.user (includes tenantId) — required before tenantScope
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    const error = new Error('Not authorized — no token provided');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('Not authorized — invalid or expired token');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    const error = new Error('Not authorized — user no longer exists');
    error.statusCode = 401;
    throw error;
  }

  req.user = user; // includes tenantId, role
  next();
});

module.exports = protect;