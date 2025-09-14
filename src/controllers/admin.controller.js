const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const mlService = require('../services/mlService');
const { emitAlert } = require('../services/socketService');
const reportService = require('../services/reportService');

// Get admin dashboard with sensors, alerts, risk assessment, and map overlay
const dashboard = asyncHandler(async (req, res) => {
  const [sensors, alerts] = await Promise.all([
    Sensor.find().lean(),
    Alert.find().sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  const risk = await mlService.getRiskPrediction(sensors);
  const overlay = await mlService.getRiskOverlay();
  res.json({ sensors, alerts, risk, overlay });
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

module.exports = { dashboard, createAlert, updateAlert, reports, exportReports };
