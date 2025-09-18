# 🏠 Local Development Guide

## 🚀 Quick Start Commands

### **Option 1: Interactive Scripts (Recommended)**
```bash
# Windows Batch File
run-local.bat

# PowerShell (More features)
.\run-local.ps1
```

### **Option 2: Direct NPM Commands**
```bash
# First time setup
npm run setup

# Development mode (auto-reload)
npm run local

# Production build locally
npm run serve

# Quick start (if already built)
npm run dev
```

## 📋 Prerequisites

### **1. Environment File**
Create a `.env` file in the root directory:
```bash
# Copy from example
copy .env.example .env

# Edit with your values
notepad .env
```

### **2. Required Environment Variables**
```bash
# Database (Required)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-management

# Authentication (Required)
JWT_SECRET=your-secure-jwt-secret-32-characters-minimum

# Server Configuration
PORT=10000
NODE_ENV=development
```

### **3. MongoDB Setup**
- **Option A**: MongoDB Atlas (Cloud - Recommended)
  - Create free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
  - Whitelist your IP address
  - Get connection string

- **Option B**: Local MongoDB
  - Install MongoDB locally
  - Use: `mongodb://localhost:27017/disaster-management`

## 🌐 Access URLs

After starting the server:
- **Frontend**: http://localhost:10000
- **API**: http://localhost:10000/api
- **Health Check**: http://localhost:10000/health
- **Admin Dashboard**: http://localhost:10000 (login as admin)

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@disaster.com | admin123 |
| Operator | operator@disaster.com | operator123 |

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | First-time setup (install all dependencies) |
| `npm run local` | Full development mode (build + watch) |
| `npm run dev` | Start server only (nodemon with auto-reload) |
| `npm run serve` | Production build + start |
| `npm run build:frontend` | Build frontend only |
| `npm run install:all` | Install backend + frontend dependencies |

## 🔍 Troubleshooting

### **Database Connection Issues**
```bash
# Check if MongoDB is accessible
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected')).catch(err => console.error('❌ Error:', err.message));"
```

### **Port Already in Use**
```bash
# Kill process on port 10000
netstat -ano | findstr :10000
taskkill /PID <PID_NUMBER> /F
```

### **Frontend Build Issues**
```bash
# Clean install frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
cd ..
```

### **Clear Everything and Restart**
```bash
# Clean all dependencies
rm -rf node_modules frontend/node_modules
npm run setup
```

## 📁 Project Structure

```
├── frontend/          # React + TypeScript + Vite
├── src/              # Backend source (legacy)
├── production-server.js  # Main server file
├── start.js          # Production startup
├── .env              # Environment variables (create this)
├── .env.example      # Environment template
├── run-local.bat     # Windows batch script
├── run-local.ps1     # PowerShell script
└── package.json      # Dependencies and scripts
```

## 🔄 Development Workflow

1. **First Time**:
   ```bash
   npm run setup
   # Create and configure .env file
   npm run local
   ```

2. **Daily Development**:
   ```bash
   npm run local  # or use run-local.ps1
   ```

3. **Testing Production Build**:
   ```bash
   npm run serve
   ```

## 🚀 Ready for Production?

When ready to deploy:
1. Push to GitHub
2. Deploy to Render/Railway/Fly.io
3. Set environment variables in deployment platform
4. Your app will be live!

## 📞 Need Help?

- Check the health endpoint: http://localhost:10000/health
- Look at server logs in the terminal
- Verify your `.env` file configuration
- Ensure MongoDB is accessible
