const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

const createPaymentSchema = z.object({
  studentId: objectId,
  amount: z.number().int().min(100, 'Amount must be at least 100 (smallest currency unit)'),
  currency: z.string().length(3).optional(),
  description: z.string().trim().min(2),
  dueDate: z.string().datetime().optional(),
});

module.exports = { createPaymentSchema };