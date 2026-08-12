const express = require('express');
const protect = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const validate = require('../middleware/validate');
const {
  createSessionSchema,
  createRecurringSessionSchema,
  updateSessionSchema,
  markAttendanceSchema,
} = require('../validators/sessionValidators');
const {
  getSessions,
  getSessionById,
  createSession,
  createRecurringSessions,
  updateSession,
  deleteSession,
  markAttendance,
} = require('../controllers/sessionController');

const router = express.Router();
router.use(protect, tenantScope);

router.get('/', getSessions);
router.get('/:id', getSessionById);
router.post('/', validate(createSessionSchema), createSession);
router.post('/recurring', validate(createRecurringSessionSchema), createRecurringSessions);
router.patch('/:id', validate(updateSessionSchema), updateSession);
router.delete('/:id', deleteSession);
router.post('/:id/attendance', validate(markAttendanceSchema), markAttendance);

module.exports = router;