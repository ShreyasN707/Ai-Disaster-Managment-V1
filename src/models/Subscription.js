const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    notificationType: { type: String, enum: ['sms', 'email', 'push'], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
