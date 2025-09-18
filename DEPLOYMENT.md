# 🚀 AI Disaster Management System - Deployment Guide

This guide provides step-by-step instructions for deploying the AI Disaster Management System in various environments, including cloud platforms like Render.

## ☁️ Deploy to Render (Recommended for Production)

### 1. Prerequisites
- GitHub account with your repository
- Render account (free tier available)
- MongoDB Atlas account (free tier available)

### 2. Database Setup (MongoDB Atlas)
1. Create a free MongoDB Atlas cluster
2. Create a database user
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/disaster-management`

### 3. Deploy to Render
1. **Connect Repository**: Link your GitHub repository to Render
2. **Service Configuration**:
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Environment**: Node.js
   - **Plan**: Free (or paid for better performance)

3. **Environment Variables** (Set in Render Dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-management
   JWT_SECRET=your-super-secret-jwt-key-change-this
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

4. **Optional SMS Variables** (Twilio):
   ```
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number
   ```

### 4. Gmail Setup for Notifications
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → App passwords
3. Use the 16-character app password as `EMAIL_PASS`

### 5. Deploy Steps
1. Push your code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set environment variables
5. Deploy!

Your app will be available at: `https://your-app-name.onrender.com`

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18 or higher
- **MongoDB**: v7.0 or higher
- **Docker**: v20.10 or higher (for containerized deployment)
- **Python**: v3.8 or higher (for ML model training)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 10GB free space

### Development Tools
- Git
- npm or yarn
- Docker Compose
- MongoDB Compass (optional, for database management)

## 🐳 Quick Deploy with Docker (Recommended)

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd ai-disaster-managment--v2/Ai-Disaster-Managment-V1
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit configuration files
nano .env  # Update with your settings
nano frontend/.env  # Update frontend settings
```

### 3. Deploy Services
```bash
# Start all services (MongoDB, Redis, App)
npm run docker:run

# View logs
npm run docker:logs

# Check service status
docker-compose ps
```

### 4. Initialize System
```bash
# The system will automatically:
# - Create database collections
# - Insert sample data
# - Initialize ML service (mock mode by default)
```

### 5. Access Application
- **Web Interface**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health
- **ML Status**: http://localhost:4000/api/ml/status

### 6. Default Credentials
```
Admin User:
Email: admin@disaster.com
Password: admin123 (change in production!)

Operator User:
Email: operator@disaster.com
Password: operator123 (change in production!)
```

## 🛠️ Manual Deployment

### 1. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm install                    # Backend dependencies
cd frontend && npm install     # Frontend dependencies
```

### 2. Database Setup
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Initialize database (optional)
mongo < scripts/init-mongo.js
```

### 3. Build Application
```bash
# Build everything
npm run build

# Or build components separately
npm run build:frontend        # Build frontend only
```

### 4. Configure Environment
```bash
# Ensure .env is properly configured
cat .env

# Key settings to verify:
# - MONGO_URI points to your MongoDB instance
# - JWT_SECRET is set to a secure value
# - ADMIN_REGISTRATION_CODE is set
```

### 5. Start Application
```bash
# Production mode
npm start

# Development mode
npm run dev
```

## 🧠 ML Model Setup

### Option 1: Use Mock Model (Default)
The system runs with a demonstration model by default. No additional setup required.

### Option 2: Train Custom Model
```bash
# 1. Prepare training data
mkdir -p data/TrainData/{img,mask}
mkdir -p data/TestData/{img,mask}
# Place your .h5 files in respective directories

# 2. Install Python dependencies
pip install tensorflow keras numpy h5py scikit-learn tensorflowjs

# 3. Train model
npm run train:ml

# 4. Enable real ML service
# In .env file:
ENABLE_ML_SERVICE=true
ML_MODEL_PATH=./tfjs_model
```

### Option 3: Use Pre-trained Model
```bash
# 1. Download pre-trained model to tfjs_model/
# 2. Update .env:
ENABLE_ML_SERVICE=true
ML_MODEL_PATH=./tfjs_model
```

## 🌐 Production Deployment

### 1. Security Configuration
```bash
# Update .env with production values:
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key-here
ADMIN_REGISTRATION_CODE=your-secure-admin-code
MONGO_URI=mongodb://username:password@your-mongo-host:27017/ai_disaster_mgmt

# Frontend .env:
VITE_API_BASE_URL=https://your-domain.com/api
```

### 2. SSL/HTTPS Setup
```bash
# Option 1: Use reverse proxy (nginx)
# Copy nginx.conf template and configure SSL

# Option 2: Use cloud provider SSL termination
# Configure your load balancer/CDN for SSL
```

### 3. Database Security
```bash
# Enable MongoDB authentication
# Create dedicated database user
# Configure network access restrictions
# Set up regular backups
```

### 4. Monitoring Setup
```bash
# Set up log aggregation
# Configure health check monitoring
# Set up alerting for critical issues
# Monitor ML model performance
```

## 🔧 Configuration Reference

### Backend Environment Variables
```bash
# Server Configuration
PORT=4000                                    # Server port
NODE_ENV=production                          # Environment mode
ORIGIN=http://localhost:3000                 # CORS origin

# Database
MONGO_URI=mongodb://localhost:27017/ai_disaster_mgmt

# Authentication
JWT_SECRET=your-jwt-secret                   # JWT signing secret
JWT_EXPIRES_IN=7d                           # Token expiration
ADMIN_REGISTRATION_CODE=admin-code          # Admin registration code

# ML Service
ENABLE_ML_SERVICE=true                      # Enable/disable ML features
ML_MODEL_PATH=./tfjs_model                  # Path to TensorFlow.js model
ML_PREDICTION_ENDPOINT=http://localhost:5000 # External ML service URL

# File Uploads
UPLOAD_DIR=uploads                          # Upload directory

# Logging
LOG_LEVEL=info                              # Log level (error, warn, info, debug)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000                 # Rate limit window (15 min)
RATE_LIMIT_MAX_REQUESTS=100                 # Max requests per window
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:4000/api # Backend API URL

# Application
VITE_APP_NAME=AI Disaster Management System # App name
VITE_APP_VERSION=1.0.0                      # App version

# Feature Flags
VITE_ENABLE_ML_FEATURES=true                # Enable ML features
VITE_ENABLE_REAL_TIME_ALERTS=true          # Enable real-time alerts
VITE_ENABLE_ANALYTICS=false                 # Enable analytics

# Map Configuration (if using maps)
VITE_MAP_API_KEY=your-map-api-key          # Map service API key
VITE_DEFAULT_MAP_CENTER_LAT=37.7749        # Default map center latitude
VITE_DEFAULT_MAP_CENTER_LNG=-122.4194      # Default map center longitude
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Frontend Build Errors
```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend && npm install

# Check for TypeScript errors
cd frontend && npm run build
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Test connection
mongo --eval "db.adminCommand('ping')"

# Check connection string in .env
```

#### 3. ML Service Issues
```bash
# Check ML status
curl http://localhost:4000/api/ml/status

# View logs for ML errors
npm run docker:logs | grep ml

# Disable ML service temporarily
# In .env: ENABLE_ML_SERVICE=false
```

#### 4. Port Conflicts
```bash
# Check what's using port 4000
lsof -i :4000

# Change port in .env
PORT=5000
```

#### 5. Docker Issues
```bash
# Clean up Docker resources
npm run docker:clean

# Rebuild containers
docker-compose build --no-cache

# Check container logs
docker-compose logs app
```

### Performance Optimization

#### 1. Database Optimization
```bash
# Create indexes for better performance
# (Already included in init-mongo.js)

# Monitor query performance
# Use MongoDB Compass or profiler
```

#### 2. Frontend Optimization
```bash
# Enable production build optimizations
cd frontend && npm run build

# Use CDN for static assets
# Configure caching headers
```

#### 3. ML Service Optimization
```bash
# Use GPU acceleration if available
# Optimize model size
# Implement result caching
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl http://localhost:4000/health

# ML service health
curl http://localhost:4000/api/ml/status

# Database health
mongo --eval "db.runCommand('ping')"
```

### Log Management
```bash
# View application logs
npm run docker:logs

# Application log files (if running manually)
tail -f logs/app.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Backup Procedures
```bash
# Database backup
mongodump --db ai_disaster_mgmt --out backup/

# File uploads backup
tar -czf uploads-backup.tar.gz uploads/

# Configuration backup
cp .env .env.backup
```

### Updates and Maintenance
```bash
# Update dependencies
npm update
cd frontend && npm update

# Update Docker images
docker-compose pull
docker-compose up -d

# Database maintenance
# Run MongoDB maintenance commands as needed
```

## 🚨 Emergency Procedures

### System Recovery
1. **Database Recovery**: Restore from latest backup
2. **Application Recovery**: Restart services, check logs
3. **ML Service Recovery**: Restart with mock model if needed
4. **Network Issues**: Check firewall, DNS, load balancer

### Rollback Procedures
1. **Code Rollback**: Deploy previous version
2. **Database Rollback**: Restore from backup
3. **Configuration Rollback**: Restore previous .env files

## 📞 Support

For deployment issues:
1. Check this deployment guide
2. Review application logs
3. Check Docker container status
4. Verify environment configuration
5. Create an issue with detailed error information

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database accessible
- [ ] SSL certificates ready (production)
- [ ] Backup procedures tested
- [ ] Monitoring configured

### Deployment
- [ ] Application builds successfully
- [ ] All services start without errors
- [ ] Health checks pass
- [ ] ML service status verified
- [ ] Frontend loads correctly

### Post-deployment
- [ ] User authentication works
- [ ] ML predictions functional
- [ ] Real-time features working
- [ ] File uploads working
- [ ] Database operations successful
- [ ] Monitoring alerts configured
- [ ] Backup schedule active

---

🎉 **Congratulations!** Your AI Disaster Management System is now deployed and ready to help save lives through intelligent disaster prediction and management.
