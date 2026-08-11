const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    guardianContact: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Every query on students is scoped by tenant — this index makes those lookups fast
studentSchema.index({ tenantId: 1, name: 1 });

module.exports = mongoose.model('Student', studentSchema);