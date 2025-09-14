const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    area: { type: String, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    medium: { type: String, enum: ['sms', 'email', 'push', 'broadcast'], default: 'broadcast' },
    message: { type: String, required: true },
    source: { type: String, enum: ['admin', 'ml'], default: 'admin' },
    active: { type: Boolean, default: true },
    acknowledgedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
