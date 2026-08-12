const { Student } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// All queries below are scoped by req.tenantId (set by tenantScope middleware) —
// this is the core multi-tenant isolation guarantee. Never trust a tenantId from the client.

// GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ tenantId: req.tenantId, isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, count: students.length, students });
});

// GET /api/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, student });
});

// POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json({ success: true, student });
});

// PATCH /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, student });
});

// DELETE /api/students/:id — soft delete, preserves attendance/billing history
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    { isActive: false },
    { new: true }
  );
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, message: 'Student removed' });
});

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };