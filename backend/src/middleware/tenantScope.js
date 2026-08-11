// Runs AFTER auth middleware (Day 3), which attaches req.user (includes tenantId).
// Every tenant-owned model (Student, Session, Payment) must be queried through req.tenantId —
// never trust a tenantId passed in the request body/params.
const tenantScope = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    const error = new Error('Tenant context missing — authentication required');
    error.statusCode = 401;
    return next(error);
  }
  req.tenantId = req.user.tenantId;
  next();
};

module.exports = tenantScope;