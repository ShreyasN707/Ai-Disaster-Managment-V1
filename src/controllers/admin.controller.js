const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const Report = require('../models/Report');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const mlService = require('../services/mlService');
const { emitAlert } = require('../services/socketService');
const reportService = require('../services/reportService');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcryptjs');

// Get admin dashboard with sensors, alerts, risk assessment, and map overlay
const dashboard = asyncHandler(async (req, res) => {
  try {
    const [sensors, alerts] = await Promise.all([
      Sensor.find().lean(),
      Alert.find().sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    
    // Handle ML service calls with fallbacks
    let risk = { level: 'low', score: 0.1, factors: { offline: 0, critical: 0, warning: 0, total: sensors.length } };
    let overlay = { type: 'FeatureCollection', features: [], metadata: { generated: new Date().toISOString() } };
    
    try {
      risk = await mlService.getRiskPrediction(sensors);
    } catch (mlError) {
      console.warn('ML risk prediction failed, using fallback:', mlError.message);
    }
    
    try {
      overlay = await mlService.getRiskOverlay(null, sensors);
    } catch (mlError) {
      console.warn('ML overlay generation failed, using fallback:', mlError.message);
    }
    
    res.json({ sensors, alerts, risk, overlay });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to load dashboard data', 
      error: error.message,
      sensors: [],
      alerts: [],
      risk: { level: 'low', score: 0.1 },
      overlay: { type: 'FeatureCollection', features: [] }
    });
  }
});

// Create and broadcast a new alert
const createAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.create({ ...req.body, source: 'admin' });
  emitAlert({ id: alert._id, ...req.body, createdAt: alert.createdAt });
  res.status(201).json({ alert });
});

// Update an existing alert by ID
const updateAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alert = await Alert.findByIdAndUpdate(id, req.body, { new: true });
  if (!alert) return res.status(404).json({ message: 'Alert not found' });
  res.json({ alert });
});

// Generate system reports with sensor stats and recent alerts
const reports = asyncHandler(async (req, res) => {
  const totalSensors = await Sensor.countDocuments();
  const online = await Sensor.countDocuments({ status: 'online' });
  const offline = await Sensor.countDocuments({ status: 'offline' });
  const critical = await Sensor.countDocuments({ health: 'critical' });

  const latestAlerts = await Alert.find().sort({ createdAt: -1 }).limit(10).lean();

  const risk = await mlService.getRiskPrediction([]);

  res.json({ summary: { totalSensors, online, offline, critical }, latestAlerts, risk });
});

// Export reports in PDF or Excel format
const exportReports = asyncHandler(async (req, res) => {
  const { format = 'pdf' } = req.query;
  const sensors = await Sensor.find().lean();
  const items = sensors.map((s) => ({ sensorId: s.sensorId, type: s.type, status: s.status, battery: s.battery, health: s.health }));

  if (format === 'excel') {
    const buf = await reportService.generateExcelReport({ title: 'Sensors Report', items });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sensors_report.xlsx"');
    return res.send(Buffer.from(buf));
  }

  const buf = await reportService.generatePdfReport({ title: 'Sensors Report', summary: { count: sensors.length }, items });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="sensors_report.pdf"');
  return res.send(buf);
});

// User Management Controllers
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const { email, password, name, role } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    role,
    isActive: true
  });

  const userResponse = user.toObject();
  delete userResponse.password;
  
  res.status(201).json({ user: userResponse });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, role, isActive } = req.body;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { email, name, role, isActive },
    { new: true }
  ).select('-password');

  res.json({ user: updatedUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent deleting the last admin
  if (user.role === 'ADMIN') {
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    if (adminCount <= 1) {
      throw new ApiError(400, 'Cannot delete the last admin user');
    }
  }

  await User.findByIdAndDelete(id);
  res.json({ message: 'User deleted successfully' });
});

// Sensor Management Controllers
const getSensors = asyncHandler(async (req, res) => {
  const sensors = await Sensor.find().lean();
  res.json({ sensors });
});

const createSensor = asyncHandler(async (req, res) => {
  const { sensorId, type, location, assignedTo } = req.body;

  const existingSensor = await Sensor.findOne({ sensorId });
  if (existingSensor) {
    throw new ApiError(400, 'Sensor with this ID already exists');
  }

  const sensor = await Sensor.create({
    sensorId,
    type,
    location,
    assignedTo,
    status: 'offline',
    battery: 100,
    health: 'good',
    createdBy: req.user.id
  });

  res.status(201).json({ sensor });
});

const updateSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { sensorId, type, location, assignedTo, status, battery, health } = req.body;

  const sensor = await Sensor.findById(id);
  if (!sensor) {
    throw new ApiError(404, 'Sensor not found');
  }

  // Check if sensorId is being changed and if it's already taken
  if (sensorId && sensorId !== sensor.sensorId) {
    const existingSensor = await Sensor.findOne({ sensorId });
    if (existingSensor) {
      throw new ApiError(400, 'Sensor ID already in use');
    }
  }

  const updatedSensor = await Sensor.findByIdAndUpdate(
    id,
    { sensorId, type, location, assignedTo, status, battery, health },
    { new: true }
  );

  res.json({ sensor: updatedSensor });
});

const deleteSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sensor = await Sensor.findById(id);
  if (!sensor) {
    throw new ApiError(404, 'Sensor not found');
  }

  await Sensor.findByIdAndDelete(id);
  res.json({ message: 'Sensor deleted successfully' });
});

module.exports = { 
  dashboard, 
  createAlert, 
  updateAlert, 
  reports, 
  exportReports,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getSensors,
  createSensor,
  updateSensor,
  deleteSensor
};
