const Alert = require('../models/Alert');
const Subscription = require('../models/Subscription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const mlService = require('../services/mlService');

// Get active alerts and current risk level
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 }).lean();
  const risk = await mlService.getRiskPrediction([]);
  res.json({ alerts, risk });
});

// Get public safety information and contacts
const getInfo = asyncHandler(async (req, res) => {
  const info = {
    faqs: [
      { q: 'What should I do during an alert?', a: 'Follow local authority guidelines and stay tuned for updates.' },
      { q: 'How can I subscribe?', a: 'Use POST /api/public/subscribe with email or phone.' },
    ],
    guidelines: [
      'Prepare an emergency kit with essentials.',
      'Keep your phone charged and enable notifications.',
      'Follow evacuation orders if issued.',
    ],
    contacts: [
      { name: 'Emergency', phone: '112' },
      { name: 'Local Authority', phone: '100' },
    ],
  };
  res.json(info);
});

// Subscribe for email/SMS notifications
const subscribe = asyncHandler(async (req, res) => {
  const { email, phone, notificationType } = req.body;

  if (!email && !phone) throw new ApiError(400, 'Email or phone is required');

  const sub = await Subscription.create({ email, phone, notificationType });
  res.status(201).json({ message: 'Subscribed', id: sub._id });
});

module.exports = { getAlerts, getInfo, subscribe };
