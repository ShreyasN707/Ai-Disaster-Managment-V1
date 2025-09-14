const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    data: { type: mongoose.Schema.Types.Mixed },
    trends: { type: mongoose.Schema.Types.Mixed },
    predictions: { type: mongoose.Schema.Types.Mixed }, // reserved for ML integration
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
