const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
    markedAt: { type: Date },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true, trim: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }],
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60, min: 15 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    recurringGroupId: { type: mongoose.Schema.Types.ObjectId, default: null }, // links instances from one recurring rule
    attendance: [attendanceRecordSchema],
  },
  { timestamps: true }
);

sessionSchema.index({ tenantId: 1, scheduledAt: 1 });

module.exports = mongoose.model('Session', sessionSchema);