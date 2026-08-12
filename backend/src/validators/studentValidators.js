const { z } = require('zod');

const createStudentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  guardianContact: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateStudentSchema = createStudentSchema.partial();

module.exports = { createStudentSchema, updateStudentSchema };