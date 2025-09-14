const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema(
  {
    sensorId: { type: String, required: true, unique: true, trim: true },
    type: { type: String, required: true },
    location: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
      address: { type: String },
    },
    status: { type: String, enum: ['online', 'offline', 'maintenance'], default: 'online' },
    battery: { type: Number, min: 0, max: 100, default: 100 },
    health: { type: String, enum: ['good', 'warning', 'critical'], default: 'good' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sensor', sensorSchema);
