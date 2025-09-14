const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    path: String,
    originalName: String,
    mimeType: String,
    size: Number,
  },
  { _id: false }
);

const incidentSchema = new mongoose.Schema(
  {
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
    notes: { type: String },
    media: [mediaSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
