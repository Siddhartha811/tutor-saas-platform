const jwt = require('jsonwebtoken');

const generateToken = (userId, tenantId) => {
  return jwt.sign({ userId, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;