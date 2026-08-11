const express = require('express');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');

const router = express.Router();

router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: { id: req.user._id, role: req.user.role, tenantId: req.user.tenantId } });
});

router.get('/owner-only', protect, authorize('owner'), (req, res) => {
  res.json({ success: true, message: 'Owner access confirmed' });
});

module.exports = router;