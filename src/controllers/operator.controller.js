const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');
const { emitAcknowledgement } = require('../services/socketService');
const ApiError = require('../utils/ApiError');

// Get operator dashboard with assigned sensors and recent alerts
const dashboard = asyncHandler(async (req, res) => {
  try {
    // For now, return all sensors if none are specifically assigned to the operator
    // This is because the current system doesn't have proper sensor assignment logic
    let sensors = await Sensor.find({ assignedTo: req.user.id }).lean();
    
    // If no sensors are assigned, return all sensors for demonstration
    if (sensors.length === 0) {
      sensors = await Sensor.find().lean();
    }
    
    const recentAlerts = await Alert.find({ active: true }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ sensors, alerts: recentAlerts });
  } catch (error) {
    console.error('Operator dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to load dashboard data', 
      error: error.message,
      sensors: [],
      alerts: []
    });
  }
});

// Acknowledge an alert and notify via socket
const acknowledge = asyncHandler(async (req, res) => {
  const { alertId, notes } = req.body;
  const alert = await Alert.findById(alertId);
  if (!alert) throw new ApiError(404, 'Alert not found');
  if (!alert.acknowledgedBy.includes(req.user.id)) {
    alert.acknowledgedBy.push(req.user.id);
    await alert.save();
  }
  emitAcknowledgement({ alertId, operatorId: req.user.id, notes: notes || '' });
  res.json({ message: 'Acknowledged' });
});

// Register a new sensor assigned to current operator
const addSensor = asyncHandler(async (req, res) => {
  const payload = { ...req.body, assignedTo: req.user.id, createdBy: req.user.id };
  const exists = await Sensor.findOne({ sensorId: payload.sensorId });
  if (exists) throw new ApiError(409, 'Sensor ID already exists');
  const sensor = await Sensor.create(payload);
  res.status(201).json({ sensor });
});

// Update sensor details (only for assigned sensors)
const updateSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sensor = await Sensor.findById(id);
  if (!sensor) throw new ApiError(404, 'Sensor not found');
  if (sensor.assignedTo?.toString() !== req.user.id) throw new ApiError(403, 'Not allowed to modify this sensor');
  Object.assign(sensor, req.body);
  await sensor.save();
  res.json({ sensor });
});

// Create incident report with optional media attachments
const createIncident = asyncHandler(async (req, res) => {
  const { sensorId, notes } = req.body;
  const files = (req.files || []).map((f) => ({ path: f.path, originalName: f.originalname, mimeType: f.mimetype, size: f.size }));
  const incident = await Incident.create({ operatorId: req.user.id, sensorId, notes, media: files });
  res.status(201).json({ incident });
});

// Get incidents for operator
const getIncidents = asyncHandler(async (req, res) => {
  const incidents = await Incident.find({ operatorId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ incidents });
});

// Get alerts for operator
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 }).lean();
  res.json({ alerts });
});

module.exports = { dashboard, acknowledge, addSensor, updateSensor, createIncident, getIncidents, getAlerts };
