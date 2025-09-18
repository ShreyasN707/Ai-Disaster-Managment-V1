const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config');

// Import models
const User = require('../src/models/User');
const Sensor = require('../src/models/Sensor');
const Alert = require('../src/models/Alert');

async function addSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Sensor.deleteMany({});
    // await Alert.deleteMany({});

    // Create sample users if they don't exist
    const adminExists = await User.findOne({ email: 'admin@disaster.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        email: 'admin@disaster.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        isActive: true
      });
      console.log('✅ Admin user created');
    }

    const operatorExists = await User.findOne({ email: 'operator@disaster.com' });
    if (!operatorExists) {
      const hashedPassword = await bcrypt.hash('operator123', 12);
      await User.create({
        email: 'operator@disaster.com',
        password: hashedPassword,
        name: 'Emergency Operator',
        role: 'OPERATOR',
        isActive: true
      });
      console.log('✅ Operator user created');
    }

    // Create sample sensors
    const sensorCount = await Sensor.countDocuments();
    if (sensorCount === 0) {
      const sampleSensors = [
        {
          sensorId: 'SEIS-001',
          type: 'Seismic Monitor',
          location: {
            lat: 37.7749,
            lng: -122.4194,
            address: 'San Francisco, CA'
          },
          status: 'online',
          battery: 85,
          health: 'good',
          lastReading: '2024-01-15 14:30:00'
        },
        {
          sensorId: 'WEATHER-001',
          type: 'Weather Station',
          location: {
            lat: 37.7849,
            lng: -122.4094,
            address: 'Oakland, CA'
          },
          status: 'online',
          battery: 92,
          health: 'good',
          lastReading: '2024-01-15 14:25:00'
        },
        {
          sensorId: 'SOIL-001',
          type: 'Soil Moisture',
          location: {
            lat: 37.7949,
            lng: -122.3994,
            address: 'Berkeley, CA'
          },
          status: 'warning',
          battery: 45,
          health: 'warning',
          lastReading: '2024-01-15 13:15:00'
        },
        {
          sensorId: 'TEMP-001',
          type: 'Temperature Sensor',
          location: {
            lat: 37.8049,
            lng: -122.3894,
            address: 'Richmond, CA'
          },
          status: 'offline',
          battery: 12,
          health: 'critical',
          lastReading: '2024-01-15 10:45:00'
        },
        {
          sensorId: 'HUMID-001',
          type: 'Humidity Sensor',
          location: {
            lat: 37.7649,
            lng: -122.4294,
            address: 'Daly City, CA'
          },
          status: 'online',
          battery: 78,
          health: 'good',
          lastReading: '2024-01-15 14:28:00'
        },
        {
          sensorId: 'WATER-001',
          type: 'Water Level Monitor',
          location: {
            lat: 37.7549,
            lng: -122.4394,
            address: 'Pacifica, CA'
          },
          status: 'online',
          battery: 95,
          health: 'good',
          lastReading: '2024-01-15 14:32:00'
        }
      ];

      await Sensor.insertMany(sampleSensors);
      console.log('✅ Sample sensors created');
    }

    // Create sample alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      const sampleAlerts = [
        {
          area: 'San Francisco Bay Area',
          severity: 'high',
          message: 'Seismic activity detected in the region. All monitoring stations are on high alert.',
          source: 'ml',
          active: true
        },
        {
          area: 'Oakland Hills',
          severity: 'medium',
          message: 'Weather conditions show potential for landslide risk. Monitoring soil moisture levels.',
          source: 'admin',
          active: true
        },
        {
          area: 'Richmond District',
          severity: 'critical',
          message: 'Temperature sensor offline. Technical team dispatched for immediate repair.',
          source: 'admin',
          active: true
        },
        {
          area: 'Berkeley Campus',
          severity: 'low',
          message: 'Routine maintenance completed on soil moisture sensors. All systems operational.',
          source: 'admin',
          active: false
        },
        {
          area: 'Pacifica Coast',
          severity: 'medium',
          message: 'High tide warning issued. Water level monitors showing elevated readings.',
          source: 'ml',
          active: true
        }
      ];

      await Alert.insertMany(sampleAlerts);
      console.log('✅ Sample alerts created');
    }

    console.log('🎉 Sample data initialization completed successfully!');
    console.log('📊 Dashboard should now display sensor and alert data');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  addSampleData();
}

module.exports = addSampleData;
