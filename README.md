# AI Disaster Management System

A comprehensive, production-ready AI-powered disaster management system with landslide prediction capabilities, real-time monitoring, and role-based access control.

## 🌟 Features

### 🎯 Core Capabilities
- **AI-Powered Landslide Prediction**: TensorFlow.js U-Net model for satellite image analysis
- **Real-time Monitoring**: Live sensor data and automated alerts via Socket.IO
- **Role-Based Access Control**: Admin, Operator, and Public user roles with JWT authentication
- **Geographic Risk Assessment**: GeoJSON-based risk overlays and sensor mapping
- **Incident Management**: Report, track, and manage disaster incidents
- **Data Export**: PDF and Excel report generation

### 🔧 Technical Stack
- **Frontend**: React + TypeScript + Vite with modern UI components (shadcn/ui)
- **Backend**: Node.js + Express + MongoDB with comprehensive security
- **ML Component**: Python TensorFlow/Keras with TensorFlow.js export
- **Database**: MongoDB with validation schemas and geospatial indexing
- **Security**: Helmet, CORS, XSS protection, rate limiting, input sanitization
- **Real-time**: Socket.IO for live updates and notifications

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)

1. **Clone and setup**
```bash
git clone <repository-url>
cd ai-disaster-managment--v2/Ai-Disaster-Managment-V1
```

2. **Configure environment**
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
# Edit .env files with your configuration
```

3. **Deploy with Docker**
```bash
npm run docker:run
```

4. **Access the application**
- Frontend + Backend: http://localhost:4000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Option 2: Manual Setup

1. **Install dependencies**
```bash
npm run install:all
```

2. **Build the project**
```bash
npm run build
```

3. **Start MongoDB**
```bash
# Install and start MongoDB locally
mongod --dbpath /path/to/data
```

4. **Run the application**
```bash
npm start
```

## 📋 API Documentation

### 🔐 Authentication Endpoints
```
POST /api/auth/register    # Register new user (requires admin code for admin role)
POST /api/auth/login       # User login
GET  /api/auth/me         # Get current user profile
```

### 🤖 ML Prediction Endpoints
```
GET  /api/ml/status                    # Get ML service status
POST /api/ml/predict/landslide         # Predict landslide from image (returns PNG mask)
POST /api/ml/predict/landslide/json    # Predict landslide from image (returns JSON)
GET  /api/ml/risk/prediction          # Get current risk assessment
GET  /api/ml/risk/overlay             # Get GeoJSON risk overlay
```

### 🌍 Public Endpoints
```
GET  /api/public/alerts    # Get public alerts
GET  /api/public/info      # Get system information
POST /api/public/subscribe # Subscribe to notifications
```

### 👨‍💼 Admin Endpoints
```
GET  /api/admin/dashboard              # Admin dashboard data
POST /api/admin/alerts                 # Create new alert
PUT  /api/admin/alerts/:id            # Update alert
GET  /api/admin/reports               # Get reports
GET  /api/admin/reports/export        # Export reports (PDF/Excel)
```

### 👨‍🔧 Operator Endpoints
```
GET  /api/operator/dashboard           # Operator dashboard data
POST /api/operator/acknowledge         # Acknowledge alert
POST /api/operator/sensors            # Create sensor
PUT  /api/operator/sensors/:id        # Update sensor
POST /api/operator/incidents          # Report incident
```

## 🧠 Machine Learning Setup

### Training the Model

1. **Prepare training data**
```bash
# Organize your data in this structure:
data/
├── TrainData/
│   ├── img/     # Satellite images (.h5 files)
│   └── mask/    # Landslide masks (.h5 files)
└── TestData/
    ├── img/     # Test images (.h5 files)
    └── mask/    # Test masks (.h5 files)
```

2. **Install Python dependencies**
```bash
pip install tensorflow keras numpy h5py scikit-learn tensorflowjs
```

3. **Train and export the model**
```bash
npm run train:ml
# or
python train_and_export.py
```

4. **Enable ML service**
```bash
# In .env file:
ENABLE_ML_SERVICE=true
ML_MODEL_PATH=./tfjs_model
```

### Using Pre-trained Models

If you don't have training data, the system will run with a mock model that generates demonstration predictions.

## 🐳 Docker Configuration

### Development
```bash
npm run docker:run     # Start all services
npm run docker:logs    # View logs
npm run docker:stop    # Stop services
```

### Production
```bash
npm run deploy:production  # Deploy with production config
```

### Services Included
- **app**: Main application (frontend + backend)
- **mongodb**: Database with initialization
- **redis**: Caching and session management
- **nginx**: Reverse proxy (production profile)

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```bash
# Server
PORT=4000
NODE_ENV=production
ORIGIN=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/ai_disaster_mgmt

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
ADMIN_REGISTRATION_CODE=your-admin-code

# ML Service
ENABLE_ML_SERVICE=true
ML_MODEL_PATH=./tfjs_model

# File Uploads
UPLOAD_DIR=uploads
```

**Frontend (frontend/.env)**
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api

# Feature Flags
VITE_ENABLE_ML_FEATURES=true
VITE_ENABLE_REAL_TIME_ALERTS=true
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + TS    │◄──►│   Node.js       │◄──►│   MongoDB       │
│   Vite + UI     │    │   Express       │    │   + Validation  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   ML Service    │              │
         └──────────────►│   TensorFlow.js │──────────────┘
                        │   + Python      │
                        └─────────────────┘
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin, Operator, Public roles with different permissions
- **Input Validation**: Joi schemas and MongoDB sanitization
- **Rate Limiting**: API endpoint protection
- **CORS Configuration**: Cross-origin request security
- **Helmet Security**: HTTP header protection
- **XSS Protection**: Cross-site scripting prevention

## 📊 Monitoring & Logging

- **Health Checks**: `/health` endpoint for service monitoring
- **Structured Logging**: Winston logger with configurable levels
- **Error Handling**: Centralized error management
- **Performance Metrics**: Request timing and ML processing metrics

## 🚀 Deployment

### Production Checklist

1. **Environment Configuration**
   - [ ] Update JWT secrets
   - [ ] Configure production database
   - [ ] Set secure admin registration code
   - [ ] Configure CORS origins

2. **Security**
   - [ ] Enable HTTPS
   - [ ] Configure firewall rules
   - [ ] Set up SSL certificates
   - [ ] Review rate limiting settings

3. **Monitoring**
   - [ ] Set up log aggregation
   - [ ] Configure health check monitoring
   - [ ] Set up alerting for system issues

4. **Backup**
   - [ ] Configure database backups
   - [ ] Set up file upload backups
   - [ ] Test disaster recovery procedures

### Scaling Considerations

- **Load Balancing**: Use nginx or cloud load balancers
- **Database Scaling**: MongoDB replica sets and sharding
- **Caching**: Redis for session management and API caching
- **CDN**: Serve static assets via CDN
- **Microservices**: Split ML service into separate container

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Examine the Docker logs: `npm run docker:logs`

## 🔄 Version History

- **v1.0.0**: Initial release with landslide prediction and real-time monitoring
- Complete frontend-backend integration
- Docker deployment configuration
- Production-ready security features
