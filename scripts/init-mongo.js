// MongoDB initialization script for AI Disaster Management System

// Switch to the application database
db = db.getSiblingDB('ai_disaster_mgmt');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_disaster_mgmt'
    }
  ]
});

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'must be a string with at least 6 characters'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'operator', 'public'],
          description: 'must be one of admin, operator, or public'
        },
        name: {
          bsonType: 'string',
          description: 'optional user name'
        },
        isActive: {
          bsonType: 'bool',
          description: 'user active status'
        }
      }
    }
  }
});

db.createCollection('alerts', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'message', 'severity', 'status'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          description: 'alert title is required'
        },
        message: {
          bsonType: 'string',
          minLength: 1,
          description: 'alert message is required'
        },
        severity: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'must be one of low, medium, high, or critical'
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'acknowledged', 'resolved'],
          description: 'must be one of active, acknowledged, or resolved'
        },
        location: {
          bsonType: 'object',
          properties: {
            type: {
              bsonType: 'string',
              enum: ['Point'],
              description: 'must be Point for GeoJSON'
            },
            coordinates: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                bsonType: 'double'
              },
              description: 'must be [longitude, latitude]'
            }
          }
        }
      }
    }
  }
});

db.createCollection('sensors', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'location', 'status'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 1,
          description: 'sensor name is required'
        },
        type: {
          bsonType: 'string',
          enum: ['seismic', 'weather', 'soil', 'water', 'temperature', 'humidity'],
          description: 'must be a valid sensor type'
        },
        status: {
          bsonType: 'string',
          enum: ['online', 'offline', 'maintenance'],
          description: 'must be one of online, offline, or maintenance'
        },
        health: {
          bsonType: 'string',
          enum: ['good', 'warning', 'critical'],
          description: 'must be one of good, warning, or critical'
        },
        location: {
          bsonType: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: {
              bsonType: 'string',
              enum: ['Point'],
              description: 'must be Point for GeoJSON'
            },
            coordinates: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                bsonType: 'double'
              },
              description: 'must be [longitude, latitude]'
            }
          }
        }
      }
    }
  }
});

db.createCollection('incidents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'severity', 'status', 'reportedBy'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 1,
          description: 'incident title is required'
        },
        description: {
          bsonType: 'string',
          minLength: 1,
          description: 'incident description is required'
        },
        severity: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'must be one of low, medium, high, or critical'
        },
        status: {
          bsonType: 'string',
          enum: ['reported', 'investigating', 'resolved', 'closed'],
          description: 'must be a valid status'
        },
        reportedBy: {
          bsonType: 'objectId',
          description: 'must be a valid user ObjectId'
        }
      }
    }
  }
});

db.createCollection('predictions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['type', 'riskLevel', 'confidence', 'modelVersion'],
      properties: {
        type: {
          bsonType: 'string',
          enum: ['landslide', 'earthquake', 'flood', 'wildfire'],
          description: 'must be a valid prediction type'
        },
        riskLevel: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'must be one of low, medium, high, or critical'
        },
        confidence: {
          bsonType: 'double',
          minimum: 0,
          maximum: 1,
          description: 'must be between 0 and 1'
        },
        modelVersion: {
          bsonType: 'string',
          description: 'ML model version used for prediction'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: 1 });

db.alerts.createIndex({ severity: 1 });
db.alerts.createIndex({ status: 1 });
db.alerts.createIndex({ createdAt: -1 });
db.alerts.createIndex({ location: '2dsphere' });

db.sensors.createIndex({ type: 1 });
db.sensors.createIndex({ status: 1 });
db.sensors.createIndex({ health: 1 });
db.sensors.createIndex({ location: '2dsphere' });

db.incidents.createIndex({ severity: 1 });
db.incidents.createIndex({ status: 1 });
db.incidents.createIndex({ reportedBy: 1 });
db.incidents.createIndex({ createdAt: -1 });

db.predictions.createIndex({ type: 1 });
db.predictions.createIndex({ riskLevel: 1 });
db.predictions.createIndex({ createdAt: -1 });

// Insert sample data for development
db.users.insertMany([
  {
    email: 'admin@disaster.com',
    password: '$2a$10$rQZ8ZqZqZqZqZqZqZqZqZOE', // This should be properly hashed
    role: 'admin',
    name: 'System Administrator',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'operator@disaster.com',
    password: '$2a$10$rQZ8ZqZqZqZqZqZqZqZqZOE', // This should be properly hashed
    role: 'operator',
    name: 'Emergency Operator',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.sensors.insertMany([
  {
    name: 'Seismic Sensor SF-01',
    type: 'seismic',
    status: 'online',
    health: 'good',
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    },
    threshold: 80,
    lastReading: {
      value: 65,
      timestamp: new Date(),
      unit: 'magnitude'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Weather Station WS-01',
    type: 'weather',
    status: 'online',
    health: 'warning',
    location: {
      type: 'Point',
      coordinates: [-122.4094, 37.7849]
    },
    threshold: 75,
    lastReading: {
      value: 78,
      timestamp: new Date(),
      unit: 'precipitation_mm'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Soil Monitor SM-01',
    type: 'soil',
    status: 'offline',
    health: 'critical',
    location: {
      type: 'Point',
      coordinates: [-122.3994, 37.7949]
    },
    threshold: 70,
    lastReading: {
      value: 85,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      unit: 'moisture_percent'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.alerts.insertMany([
  {
    title: 'High Seismic Activity Detected',
    message: 'Unusual seismic activity detected in the Bay Area. Monitoring situation closely.',
    severity: 'medium',
    status: 'active',
    location: {
      type: 'Point',
      coordinates: [-122.4194, 37.7749]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Sensor Offline Alert',
    message: 'Soil Monitor SM-01 has gone offline. Technical team dispatched.',
    severity: 'high',
    status: 'acknowledged',
    location: {
      type: 'Point',
      coordinates: [-122.3994, 37.7949]
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('✅ AI Disaster Management database initialized successfully!');
print('📊 Sample data inserted for development and testing.');
print('🔐 Remember to change default passwords in production!');
