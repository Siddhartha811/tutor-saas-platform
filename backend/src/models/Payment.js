const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true, min: 1 }, // smallest currency unit (e.g. paise)
    currency: { type: String, default: 'inr' },
    description: { type: String, trim: true, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'pending' },
    dueDate: { type: Date },
    paidAt: { type: Date },
    stripeCheckoutSessionId: { type: String },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);