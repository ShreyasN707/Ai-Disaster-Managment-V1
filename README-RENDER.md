# 🚀 Deploy AI Disaster Management System to Render

## Quick Deploy Guide

### 1. Prerequisites
- GitHub repository with this code
- Render account (free)
- MongoDB Atlas account (free)

### 2. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free cluster
3. Create database user
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/disaster-management`

### 3. Render Deployment
1. **Fork/Clone** this repository to your GitHub
2. **Login to Render** and create new Web Service
3. **Connect Repository** - select your GitHub repo
4. **Configure Service**:
   - **Name**: `ai-disaster-management`
   - **Environment**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 4. Environment Variables
Set these in Render Dashboard → Environment:

**Required:**
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-management
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

**Email Notifications (Recommended):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-gmail-app-password
```

**SMS Notifications (Optional):**
```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### 5. Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use the 16-character password as `EMAIL_PASS`

### 6. Deploy!
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Your app will be available at: `https://your-service-name.onrender.com`

## 🔧 Default Login Credentials

**Admin:**
- Email: `admin@disaster.com`
- Password: `admin123`

**Operator:**
- Email: `operator@disaster.com`
- Password: `operator123`

## 🌟 Features Available After Deployment

### Admin Dashboard
- ✅ View all incident reports
- ✅ Update report status (pending → reviewed → resolved)
- ✅ Export reports to CSV
- ✅ Real-time notifications
- ✅ User management
- ✅ System analytics

### Operator Dashboard
- ✅ Submit incident reports
- ✅ View personal report history
- ✅ Real-time status updates
- ✅ File attachments (ready for implementation)

### Public Features
- ✅ View active alerts
- ✅ Subscribe to notifications
- ✅ Emergency contact information

## 🔍 Troubleshooting

### Build Fails
- Check that all environment variables are set
- Ensure MongoDB connection string is correct
- Verify Node.js version is 18+

### App Won't Start
- Check logs in Render dashboard
- Verify `MONGO_URI` is accessible
- Ensure `JWT_SECRET` is at least 32 characters

### Database Connection Issues
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- Check username/password in connection string
- Verify cluster is running

## 📞 Support
If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test MongoDB connection
4. Check the `/health` endpoint

## 🔄 Updates
To update your deployment:
1. Push changes to GitHub
2. Render will automatically redeploy
3. Monitor logs during deployment
