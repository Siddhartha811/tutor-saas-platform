const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens only'],
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);