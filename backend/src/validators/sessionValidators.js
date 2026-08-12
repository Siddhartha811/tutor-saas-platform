const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid student ID');

const createSessionSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  students: z.array(objectId).min(1, 'At least one student is required'),
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO datetime' }),
  durationMinutes: z.number().int().min(15).max(480).optional(),
});

const createRecurringSessionSchema = createSessionSchema.extend({
  weeksCount: z.number().int().min(1).max(52, 'Max 52 recurring sessions at once'),
});

const updateSessionSchema = z.object({
  title: z.string().trim().min(2).optional(),
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

const markAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: objectId,
        status: z.enum(['present', 'absent', 'late', 'excused']),
      })
    )
    .min(1, 'At least one attendance record is required'),
});

module.exports = {
  createSessionSchema,
  createRecurringSessionSchema,
  updateSessionSchema,
  markAttendanceSchema,
};