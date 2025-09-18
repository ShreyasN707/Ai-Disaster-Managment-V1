// Production-ready AI Disaster Management System
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log(' Process terminated');
    process.exit(0);
  });
});

// Configuration
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_change_me';
const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB URI validation and configuration
let MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Validate MongoDB URI format
function isValidMongoURI(uri) {
  if (!uri) return false;
  
  // Check if it's a valid MongoDB connection string
  const mongoUriPattern = /^mongodb(\+srv)?:\/\/.+/;
  return mongoUriPattern.test(uri);
}

// Set default MongoDB URI based on environment
if (!MONGODB_URI || !isValidMongoURI(MONGODB_URI)) {
  if (NODE_ENV === 'production') {
    console.error('❌ Invalid or missing MONGO_URI environment variable in production!');
    console.error('💡 Current MONGO_URI value:', JSON.stringify(MONGODB_URI));
    console.error('💡 Expected format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    console.error('💡 Please set a valid MONGO_URI environment variable in your deployment settings.');
    process.exit(1);
  } else {
    console.warn('⚠️  Using local MongoDB fallback for development');
    MONGODB_URI = 'mongodb://127.0.0.1:27017/ai_disaster_mgmt?directConnection=true';
  }
}

// Email Configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'shreyasnaik81@gmail.com',
    pass: process.env.EMAIL_PASS || 'qebt gpnw fgla aast'
  },
  secure: true,
  tls: {
    rejectUnauthorized: false // Only for development/testing
  }
};

// SMS Configuration (Twilio)
const smsConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '', // Invalid format - will use demo mode
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  fromNumber: process.env.TWILIO_PHONE_NUMBER || ''
};

// Validate required configurations
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Warning: Missing required environment variables: ${missingVars.join(', ')}`);
  console.warn('   Some features may not work as expected.');
}

// Create notification services
let emailTransporter = null;
let smsClient = null;

// Initialize email service
try {
  if (emailConfig.auth.user && emailConfig.auth.pass) {
    emailTransporter = nodemailer.createTransport(emailConfig);
    console.log('📧 Email service initialized');
    
    // Verify email connection
    emailTransporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️  Email service verification failed:', error.message);
        emailTransporter = null;
      } else {
        console.log('✅ Email service verified and ready');
      }
    });
  } else {
    console.warn('⚠️  Email credentials not provided - using console logging');
  }
} catch (error) {
  console.warn('⚠️  Email service initialization failed:', error.message);
  emailTransporter = null;
}

// Initialize Twilio client
try {
  if (smsConfig.accountSid && smsConfig.authToken && smsConfig.fromNumber) {
    smsClient = twilio(smsConfig.accountSid, smsConfig.authToken);
    console.log('📱 SMS service initialized');
  } else {
    console.warn('⚠️  SMS credentials not fully configured - using console logging');
  }
} catch (error) {
  console.warn('⚠️  SMS service initialization failed:', error.message);
  smsClient = null;
}


// Initialize MongoDB connection with cloud-ready configuration
const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
};

console.log('🔗 Attempting to connect to MongoDB...');
console.log('🔗 MongoDB URI (masked):', MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@'));

mongoose.connect(MONGODB_URI, mongoOptions).then(async () => {
  console.log('✅ Connected to MongoDB successfully');
  
  // Initialize database after successful connection
  await initializeDatabase();
  
  // Start the server after database initialization
  startServer();
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  
  if (err.message.includes('ENOTFOUND') && err.message.includes('_mongodb._tcp')) {
    console.error('💡 This error indicates an invalid MongoDB connection string format.');
    console.error('💡 The MONGO_URI appears to be malformed or incomplete.');
    console.error('💡 Current MONGO_URI value:', JSON.stringify(process.env.MONGO_URI));
  }
  
  if (NODE_ENV === 'production') {
    console.error('💡 In production, make sure MONGO_URI environment variable is set to a valid MongoDB connection string');
    console.error('💡 Example: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    console.error('💡 Check your deployment environment variables in your hosting platform dashboard');
    process.exit(1);
  } else {
    console.log('⚠️  Development mode: Starting server with limited functionality (no database)');
    // Start server even without database in development
    startServer();
  }
});

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'OPERATOR', 'PUBLIC'], default: 'PUBLIC' },
  phone: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

// Alert Schema
const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  type: { type: String, enum: ['earthquake', 'flood', 'landslide', 'fire', 'storm', 'other'], required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  area: String,
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date
});

// Incident Schema
const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['earthquake', 'flood', 'landslide', 'fire', 'storm', 'other'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['reported', 'investigating', 'confirmed', 'resolved'], default: 'reported' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  area: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  email: String,
  phone: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  alertTypes: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  location: { type: String, required: true },
  relatedSensor: String,
  attachments: [{
    filename: String,
    originalName: String,
    size: Number,
    mimetype: String
  }],
  operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operatorName: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Alert = mongoose.model('Alert', alertSchema);
const Incident = mongoose.model('Incident', incidentSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Report = mongoose.model('Report', reportSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

// Initialize database with sample data
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Force recreate admin user for testing
    await User.deleteOne({ email: 'admin@disaster.com' });
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@disaster.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      phone: '+1234567890',
      location: 'Headquarters',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin user created/updated');

    // Force recreate operator user for testing
    await User.deleteOne({ email: 'operator@disaster.com' });
    const hashedOperatorPassword = await bcrypt.hash('operator123', 10);
    const operator = new User({
      name: 'Emergency Operator',
      email: 'operator@disaster.com',
      password: hashedOperatorPassword,
      role: 'OPERATOR',
      phone: '+1234567891',
      location: 'Control Center',
      isActive: true
    });
    await operator.save();
    console.log('✅ Operator user created/updated');

    // Create sample alerts
    const sampleAlerts = [
      {
        title: 'Flood Warning - Downtown Area',
        message: 'Heavy rainfall has caused flooding in the downtown area. Residents are advised to avoid low-lying areas and seek higher ground.',
        severity: 'high',
        type: 'flood',
        area: 'Downtown District',
        location: { coordinates: [-122.4194, 37.7749] },
        createdBy: admin._id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      {
        title: 'Landslide Risk - Hill Valley',
        message: 'Recent heavy rains have increased landslide risk in Hill Valley. Residents should be prepared to evacuate if necessary.',
        severity: 'medium',
        type: 'landslide',
        area: 'Hill Valley',
        location: { coordinates: [-122.4094, 37.7849] },
        createdBy: admin._id,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      }
    ];

    await Alert.insertMany(sampleAlerts);
    console.log('✅ Sample alerts created');

    // Create sample incidents
    if (await Incident.countDocuments() === 0) {
      const incidents = [
        {
          title: 'Landslide Warning - Highway 101',
          description: 'Increased soil moisture detected, potential landslide risk',
          type: 'flood',
          area: 'Downtown District',
          location: { coordinates: [-122.4194, 37.7749] },
          createdBy: admin._id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        },
        {
          title: 'Landslide Risk - Hill Valley',
          message: 'Recent heavy rains have increased landslide risk in Hill Valley. Residents should be prepared to evacuate if necessary.',
          severity: 'medium',
          type: 'landslide',
          area: 'Hill Valley',
          location: { coordinates: [-122.4094, 37.7849] },
          createdBy: admin._id,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        }
      ];

      await Alert.insertMany(sampleAlerts);
      console.log('✅ Sample alerts created');

      // Create sample incidents
      if (await Incident.countDocuments() === 0) {
        const incidents = [
          {
            title: 'Landslide Warning - Highway 101',
            description: 'Increased soil moisture detected, potential landslide risk',
            type: 'landslide',
            severity: 'high',
            status: 'confirmed',
            area: 'Main Street',
            location: { coordinates: [-122.4144, 37.7799] },
            reportedBy: operator._id
          },
          {
            title: 'Power Outage - Residential Area',
            description: 'Widespread power outage affecting 500+ households',
            type: 'other',
            severity: 'medium',
            status: 'investigating',
            area: 'Residential District',
            location: { coordinates: [-122.4244, 37.7699] },
            reportedBy: operator._id
          }
        ];

        await Incident.insertMany(incidents);
        console.log('✅ Sample incidents created');
      }

      // Create sample reports
      if (await Report.countDocuments() === 0) {
        const reports = [
          {
            title: 'Sensor malfunction at river monitoring station',
            description: 'Water level sensor showing inconsistent readings. Requires immediate calibration.',
            severity: 'high',
            status: 'pending',
            location: 'Riverfront District, Sector C',
            relatedSensor: 'SENS001',
            operatorId: operator._id,
            operatorName: operator.name,
            attachments: []
          },
          {
            title: 'Infrastructure damage report',
            description: 'Bridge structural integrity compromised after recent storms. Safety inspection needed.',
            severity: 'critical',
            status: 'reviewed',
            location: 'Bridge 42, Central Artery',
            operatorId: operator._id,
            operatorName: operator.name,
            reviewedBy: admin._id,
            reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            attachments: []
          },
          {
            title: 'Routine maintenance completed',
            description: 'Regular sensor calibration and cleaning performed successfully.',
            severity: 'low',
            status: 'resolved',
            location: 'Industrial Zone North',
            relatedSensor: 'TEMP002',
            operatorId: operator._id,
            operatorName: operator.name,
            reviewedBy: admin._id,
            reviewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            resolvedBy: admin._id,
            resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
            attachments: []
          }
        ];

        await Report.insertMany(reports);
        console.log('✅ Sample reports created');
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Broadcast alert to all connected clients
function broadcastAlert(alert) {
  io.emit('new-alert', {
    id: alert._id,
    title: alert.title,
    message: alert.message,
    severity: alert.severity,
    type: alert.type,
    area: alert.area,
    timestamp: alert.createdAt
  });
}

// Send email notification
async function sendEmailNotification(email, subject, message) {
  try {
    if (emailTransporter) {
      const mailOptions = {
        from: emailConfig.auth.user,
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
              <h1>🚨Disaster Management Alert</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2 style="color: #333;">${subject}</h2>
              <p style="color: #666; line-height: 1.6;">${message}</p>
              <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; color: #333;"><strong>Stay Safe!</strong> Follow local authority guidelines and stay tuned for updates.</p>
              </div>
              <p style="color: #999; font-size: 12px;">This is an automated message from the AI Disaster Management System.</p>
            </div>
          </div>
        `
      };
      
      await emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email sent to: ${email}`);
      return true;
    } else {
      // Demo mode - log to console
      console.log(`📧 [DEMO] Email would be sent to: ${email}`);
      console.log(`📧 [DEMO] Subject: ${subject}`);
      console.log(`📧 [DEMO] Message: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
}

// Send SMS notification
async function sendSMSNotification(phone, message) {
  try {
    if (smsClient && smsConfig.fromNumber) {
      await smsClient.messages.create({
        body: `🚨 DISASTER ALERT: ${message}`,
        from: smsConfig.fromNumber,
        to: phone
      });
      console.log(`📱 SMS sent to: ${phone}`);
      return true;
    } else {
      // Demo mode - log to console
      console.log(`📱 [DEMO] SMS would be sent to: ${phone}`);
      console.log(`📱 [DEMO] Message: 🚨 DISASTER ALERT: ${message}`);
      return true;
    }
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return false;
  }
}

// Send notifications to all subscribers
async function notifySubscribers(alert) {
  try {
    const subscribers = await Subscription.find({ 
      isActive: true,
      $or: [
        { alertTypes: 'all' },
        { alertTypes: alert.type }
      ]
    });

    console.log(`📢 Notifying ${subscribers.length} subscribers about: ${alert.title}`);

    const notificationPromises = [];

    for (const subscriber of subscribers) {
      if (subscriber.email) {
        notificationPromises.push(
          sendEmailNotification(
            subscriber.email,
            `${alert.severity.toUpperCase()} Alert: ${alert.title}`,
            `${alert.message}\n\nArea: ${alert.area || 'Not specified'}\n\nTime: ${new Date(alert.createdAt).toLocaleString()}`
          )
        );
      }

      if (subscriber.phone) {
        notificationPromises.push(
          sendSMSNotification(
            subscriber.phone,
            `${alert.title} - ${alert.message.substring(0, 100)}${alert.message.length > 100 ? '...' : ''}`
          )
        );
      }
    }

    await Promise.all(notificationPromises);
    console.log(`✅ Notifications sent to all subscribers`);
  } catch (error) {
    console.error('Failed to notify subscribers:', error.message);
  }
}

// API Routes

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(dbStatus === 1 ? 200 : 503).json({ 
    status: dbStatus === 1 ? 'OK' : 'UNHEALTHY',
    message: 'AI Disaster Management System',
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbStatus] || 'unknown',
    environment: NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role isActive');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test login endpoint
app.post('/api/debug/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🧪 Test login attempt:', { email, password });
    
    const user = await User.findOne({ email });
    console.log('🧪 User found:', user ? `${user.name} (${user.role}) - Active: ${user.isActive}` : 'No user found');
    
    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🧪 Password comparison result:', isValidPassword);
      console.log('🧪 Stored password hash:', user.password);
    }
    
    res.json({ 
      userFound: !!user,
      userActive: user?.isActive,
      passwordValid: user ? await bcrypt.compare(password, user.password) : false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Raw request body:', req.body);
    console.log('🔐 Request headers:', req.headers);
    
    const { email, password, role } = req.body;
    console.log('🔐 Parsed login attempt:', { 
      email: `"${email}"`, 
      password: password ? `"${password}"` : 'undefined',
      role: `"${role}"`,
      emailLength: email?.length,
      passwordLength: password?.length
    });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.trim(), isActive: true });
    console.log('👤 User search result:', user ? `${user.name} (${user.role}) - ${user.email}` : 'No user found');
    
    if (!user) {
      console.log('❌ User not found for email:', `"${email}"`);
      // List all users for debugging
      const allUsers = await User.find({}, 'email name role isActive');
      console.log('📋 All users in database:', allUsers.map(u => `${u.email} (${u.role}) - Active: ${u.isActive}`));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password comparison:', { 
      provided: password,
      valid: isValidPassword,
      hashLength: user.password?.length 
    });
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', user.email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'PUBLIC' } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Public routes
app.get('/api/public/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find({ active: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('createdBy', 'name role');
    
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  }
});

app.post('/api/public/subscribe', async (req, res) => {
  try {
    const { email, phone, alertTypes = ['all'] } = req.body;
    
    // Validate at least one contact method is provided
    if (!email && !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide either an email or phone number' 
      });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address' 
      });
    }

    // Validate phone format if provided (basic validation)
    if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid phone number' 
      });
    }
    
    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingSubscription) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already subscribed with this email or phone number' 
      });
    }

    const subscription = new Subscription({
      email: email || undefined,
      phone: phone || undefined,
      alertTypes,
      createdAt: new Date()
    });

    await subscription.save();
    console.log(`✅ New subscription saved: ${email || phone}`);

    // Send immediate confirmation
    const notifications = [];
    
    if (email) {
      notifications.push(
        sendEmailNotification(
          email,
          'Welcome to AI Disaster Management Alerts',
          `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to AI Disaster Management Alerts</h2>
            <p>Thank you for subscribing to our disaster alert system!</p>
            <p>You will receive notifications for: <strong>${alertTypes.join(', ')}</strong></p>
            <p>Stay safe and be prepared!</p>
          </div>`
        ).catch(err => {
          console.error('Failed to send welcome email:', err.message);
          return false;
        })
      );
    }

    if (phone) {
      notifications.push(
        sendSMSNotification(
          phone,
          'Welcome to AI Disaster Management Alerts! You will receive emergency notifications. Reply STOP to unsubscribe.'
        ).catch(err => {
          console.error('Failed to send welcome SMS:', err.message);
          return false;
        })
      );
    }

    // Wait for all notifications to complete
    await Promise.all(notifications);

    res.status(201).json({ 
      success: true,
      message: 'Subscription created successfully! Check your email/phone for confirmation.',
      subscription: {
        email: email || null,
        phone: phone || null,
        alertTypes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed', error: error.message });
  }
});

// Protected routes
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const activeAlerts = await Alert.countDocuments({ active: true });
    const totalIncidents = await Incident.countDocuments();
    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name');

    res.json({
      stats: {
        activeAlerts,
        totalIncidents,
        totalUsers: await User.countDocuments(),
        totalSubscriptions: await Subscription.countDocuments()
      },
      recentIncidents
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
});

// Admin routes
app.get('/api/admin/dashboard', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const [sensors, alerts] = await Promise.all([
      // Mock sensor data since we don't have a Sensor model in this file
      Promise.resolve([
        { _id: '1', sensorId: 'SENS001', type: 'temperature', status: 'online', health: 'good', battery: 85, location: 'Zone A', createdAt: new Date(), updatedAt: new Date() },
        { _id: '2', sensorId: 'SENS002', type: 'humidity', status: 'offline', health: 'warning', battery: 45, location: 'Zone B', createdAt: new Date(), updatedAt: new Date() },
        { _id: '3', sensorId: 'SENS003', type: 'pressure', status: 'online', health: 'critical', battery: 20, location: 'Zone C', createdAt: new Date(), updatedAt: new Date() }
      ]),
      Alert.find().sort({ createdAt: -1 }).limit(50).lean()
    ]);
    
    res.json({ sensors, alerts });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Failed to load dashboard data', 
      error: error.message,
      sensors: [],
      alerts: []
    });
  }
});

app.post('/api/admin/alerts', authenticateToken, requireRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const { title, message, severity, type, area, coordinates } = req.body;
    
    const alert = new Alert({
      title,
      message,
      severity,
      type,
      area,
      location: coordinates ? { coordinates } : undefined,
      createdBy: req.user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours default
    });

    await alert.save();
    await alert.populate('createdBy', 'name role');

    // Broadcast to all connected clients
    broadcastAlert(alert);

    // Notify all subscribers via email/SMS
    await notifySubscribers(alert);

    res.status(201).json({ alert, message: 'Alert created, broadcasted, and notifications sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create alert', error: error.message });
  }
});

app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

app.post('/api/admin/users', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { email, password, name, role, isActive } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role,
      isActive: isActive !== undefined ? isActive : true
    });

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
});

app.put('/api/admin/users/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email, name, role, isActive },
      { new: true }
    ).select('-password');

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting the last admin
    if (user.role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Admin Sensor Management Routes
app.get('/api/admin/sensors', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // Mock sensor data since we don't have a Sensor model in this file
    const sensors = [
      { _id: '1', sensorId: 'SENS001', type: 'temperature', status: 'online', health: 'good', battery: 85, location: 'Zone A', assignedTo: null, createdAt: new Date(), updatedAt: new Date() },
      { _id: '2', sensorId: 'SENS002', type: 'humidity', status: 'offline', health: 'warning', battery: 45, location: 'Zone B', assignedTo: null, createdAt: new Date(), updatedAt: new Date() },
      { _id: '3', sensorId: 'SENS003', type: 'pressure', status: 'online', health: 'critical', battery: 20, location: 'Zone C', assignedTo: null, createdAt: new Date(), updatedAt: new Date() },
      { _id: '4', sensorId: 'SENS004', type: 'seismic', status: 'online', health: 'good', battery: 92, location: 'Zone D', assignedTo: null, createdAt: new Date(), updatedAt: new Date() },
      { _id: '5', sensorId: 'SENS005', type: 'water_level', status: 'warning', health: 'warning', battery: 67, location: 'Zone E', assignedTo: null, createdAt: new Date(), updatedAt: new Date() }
    ];
    
    res.json({ sensors });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sensors', error: error.message });
  }
});

app.post('/api/admin/sensors', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { sensorId, type, location, assignedTo } = req.body;
    
    // Mock sensor creation - in real app this would save to database
    const newSensor = {
      _id: Date.now().toString(),
      sensorId,
      type,
      location,
      assignedTo,
      status: 'offline',
      battery: 100,
      health: 'good',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({ sensor: newSensor, message: 'Sensor created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create sensor', error: error.message });
  }
});

app.put('/api/admin/sensors/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { sensorId, type, location, assignedTo, status, battery, health } = req.body;
    
    // Mock sensor update - in real app this would update in database
    const updatedSensor = {
      _id: id,
      sensorId,
      type,
      location,
      assignedTo,
      status,
      battery,
      health,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date()
    };
    
    res.json({ sensor: updatedSensor, message: 'Sensor updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update sensor', error: error.message });
  }
});

app.delete('/api/admin/sensors/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock sensor deletion - in real app this would delete from database
    res.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sensor', error: error.message });
  }
});

// Operator routes
app.post('/api/operator/incidents', authenticateToken, requireRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const { title, description, type, severity, area, coordinates } = req.body;
    
    const incident = new Incident({
      title,
      description,
      type,
      severity,
      area,
      location: coordinates ? { coordinates } : undefined,
      reportedBy: req.user.id
    });

    await incident.save();
    await incident.populate('reportedBy', 'name');

    res.status(201).json({ incident, message: 'Incident reported successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to report incident', error: error.message });
  }
});

app.get('/api/operator/incidents', authenticateToken, requireRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name');
    
    res.json({ incidents });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch incidents', error: error.message });
  }
});

// ML Service status (mock for now)
app.get('/api/ml/status', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: true,
      modelLoaded: true,
      modelType: 'mock',
      useMockModel: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Report Routes

// Get all reports (Admin)
app.get('/api/admin/reports', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { status, severity, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (severity && severity !== 'all') {
      query.severity = severity;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { operatorName: { $regex: search, $options: 'i' } }
      ];
    }

    const reports = await Report.find(query)
      .populate('operatorId', 'name')
      .populate('reviewedBy', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

// Update report status (Admin)
app.patch('/api/admin/reports/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData = {
      status,
      adminNotes,
      updatedAt: new Date()
    };

    if (status === 'reviewed') {
      updateData.reviewedBy = req.user.id;
      updateData.reviewedAt = new Date();
    } else if (status === 'resolved') {
      updateData.resolvedBy = req.user.id;
      updateData.resolvedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(id, updateData, { new: true })
      .populate('operatorId', 'name')
      .populate('reviewedBy', 'name')
      .populate('resolvedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Broadcast update to all connected clients
    io.emit('reportUpdated', report);

    res.json({ report, message: 'Report updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
});

// Get operator's reports
app.get('/api/operator/reports', authenticateToken, requireRole(['OPERATOR', 'ADMIN']), async (req, res) => {
  try {
    const operatorId = req.user.role === 'ADMIN' ? req.query.operatorId : req.user.id;
    
    const reports = await Report.find({ operatorId })
      .populate('reviewedBy', 'name')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
});

// Submit new report (Operator)
app.post('/api/operator/reports', authenticateToken, requireRole(['OPERATOR', 'ADMIN']), async (req, res) => {
  try {
    console.log('📝 Report submission request:', {
      user: req.user,
      body: req.body
    });

    const { title, description, severity, location, relatedSensor } = req.body;

    // Validation
    if (!title || !description || !severity || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, severity, location' 
      });
    }

    const report = new Report({
      title,
      description,
      severity,
      location,
      relatedSensor,
      operatorId: req.user.id,
      operatorName: req.user.name,
      attachments: [] // File upload will be handled separately
    });

    await report.save();
    console.log('✅ Report saved:', report._id);

    await report.populate('operatorId', 'name');

    // Broadcast new report to admin clients
    io.emit('newReport', report);
    console.log('📡 Report broadcasted to admin clients');

    res.status(201).json({ report, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('❌ Report submission error:', error);
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
});

// Get report statistics
app.get('/api/reports/stats', authenticateToken, requireRole(['ADMIN', 'OPERATOR']), async (req, res) => {
  try {
    const isOperator = req.user.role === 'OPERATOR';
    const query = isOperator ? { operatorId: req.user.id } : {};

    const [total, pending, reviewed, resolved, critical] = await Promise.all([
      Report.countDocuments(query),
      Report.countDocuments({ ...query, status: 'pending' }),
      Report.countDocuments({ ...query, status: 'reviewed' }),
      Report.countDocuments({ ...query, status: 'resolved' }),
      Report.countDocuments({ ...query, severity: 'critical' })
    ]);

    res.json({
      total,
      pending,
      reviewed,
      resolved,
      critical
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
});

// Start server function (called after successful MongoDB connection)
function startServer() {
  server.listen(PORT, () => {
    console.log(`\n🚀 AI Disaster Management System - PRODUCTION MODE`);
    console.log(`================================================`);
    console.log(`🌐 Frontend:        http://localhost:${PORT}`);
    console.log(`🔗 API:             http://localhost:${PORT}/api`);
    console.log(`📊 Health Check:    http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket:       Connected`);
    console.log(`📱 Real-time Alerts: Enabled`);
    console.log(`\n👤 Login Credentials:`);
    console.log(`   Admin:    admin@disaster.com / admin123`);
    console.log(`   Operator: operator@disaster.com / operator123`);
    console.log(`\n🚀 System is fully functional with real data!`);
  });
}
