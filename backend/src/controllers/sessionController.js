const mongoose = require('mongoose');
const { Session } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/sessions?from=&to=
const getSessions = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const filter = { tenantId: req.tenantId };
  if (from || to) {
    filter.scheduledAt = {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }
  const sessions = await Session.find(filter).sort({ scheduledAt: 1 }).populate('students', 'name');
  res.status(200).json({ success: true, count: sessions.length, sessions });
});

const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, tenantId: req.tenantId }).populate(
    'students',
    'name'
  );
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, session });
});

// POST /api/sessions — single one-off session
const createSession = asyncHandler(async (req, res) => {
  const session = await Session.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json({ success: true, session });
});

// POST /api/sessions/recurring — generates N weekly instances from scheduledAt
const createRecurringSessions = asyncHandler(async (req, res) => {
  const { title, students, scheduledAt, durationMinutes, weeksCount } = req.body;
  const recurringGroupId = new mongoose.Types.ObjectId();
  const startDate = new Date(scheduledAt);

  const instances = Array.from({ length: weeksCount }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7);
    return {
      tenantId: req.tenantId,
      title,
      students,
      scheduledAt: date,
      durationMinutes: durationMinutes || 60,
      recurringGroupId,
    };
  });

  const sessions = await Session.insertMany(instances);
  res.status(201).json({ success: true, count: sessions.length, recurringGroupId, sessions });
});

const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, session });
});

const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ success: true, message: 'Session deleted' });
});

// POST /api/sessions/:id/attendance — bulk mark, upserts per student
const markAttendance = asyncHandler(async (req, res) => {
  const session = await Session.findOne({ _id: req.params.id, tenantId: req.tenantId });
  if (!session) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  req.body.records.forEach(({ studentId, status }) => {
    const existing = session.attendance.find((r) => r.studentId.toString() === studentId);
    if (existing) {
      existing.status = status;
      existing.markedAt = now;
    } else {
      session.attendance.push({ studentId, status, markedAt: now });
    }
  });

  session.status = 'completed';
  await session.save();

  res.status(200).json({ success: true, session });
});

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  createRecurringSessions,
  updateSession,
  deleteSession,
  markAttendance,
};