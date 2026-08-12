const express = require('express');
const protect = require('../middleware/auth');
const tenantScope = require('../middleware/tenantScope');
const validate = require('../middleware/validate');
const { createStudentSchema, updateStudentSchema } = require('../validators/studentValidators');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');

const router = express.Router();

// Every route here requires auth + tenant context — applied once for the whole router
router.use(protect, tenantScope);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', validate(createStudentSchema), createStudent);
router.patch('/:id', validate(updateStudentSchema), updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;