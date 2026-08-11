// Usage: router.delete('/:id', protect, tenantScope, authorize('owner'), deleteStudent)
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    const error = new Error(`Access denied — requires role: ${allowedRoles.join(' or ')}`);
    error.statusCode = 403;
    return next(error);
  }
  next();
};

module.exports = authorize;