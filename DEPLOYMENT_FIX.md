# 🚨 MongoDB Connection Error Fix

## Problem
Your deployment is failing with this error:
```
❌ MongoDB connection error: Error: querySrv ENOTFOUND _mongodb._tcp.234
```

This indicates that your `MONGO_URI` environment variable is set to `234` instead of a proper MongoDB connection string.

## Solution

### Step 1: Check Your Environment Variables
In your deployment platform (Render, Vercel, Netlify, etc.), check the environment variables section and look for `MONGO_URI`.

### Step 2: Fix the MONGO_URI Value
Replace the current value (`234` or whatever invalid value is there) with a proper MongoDB connection string:

#### For MongoDB Atlas (Recommended):
```
mongodb+srv://username:password@cluster.mongodb.net/disaster-management?retryWrites=true&w=majority
```

#### For MongoDB Atlas - Real Example:
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/ai-disaster-mgmt?retryWrites=true&w=majority
```

#### For Local MongoDB (Development Only):
```
mongodb://localhost:27017/disaster-management
```

### Step 3: Get Your MongoDB Connection String

#### If you're using MongoDB Atlas:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your actual credentials
7. Replace `<dbname>` with your database name (e.g., `ai-disaster-mgmt`)

#### If you don't have a MongoDB database yet:
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier available)
3. Create a database user
4. Get the connection string as described above

### Step 4: Update Environment Variables in Your Deployment Platform

#### For Render:
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Find `MONGO_URI` and update its value
5. Click "Save Changes"
6. Your service will automatically redeploy

#### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Find `MONGO_URI` and update its value
5. Redeploy your application

#### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to "Site settings" → "Environment variables"
4. Find `MONGO_URI` and update its value
5. Redeploy your application

### Step 5: Verify the Fix
After updating the environment variable:
1. Redeploy your application
2. Check the logs for successful MongoDB connection:
   ```
   ✅ Connected to MongoDB successfully
   ```
3. Your application should now start without errors

## Important Notes

- **Never** set `MONGO_URI` to just a number like `234`
- Always use the complete MongoDB connection string format
- Make sure your MongoDB cluster allows connections from your deployment platform's IP addresses
- For MongoDB Atlas, you may need to add `0.0.0.0/0` to the IP whitelist for cloud deployments

## Test Locally First
Before deploying, test your connection string locally:
1. Create a `.env` file (not `.env.example`)
2. Add your `MONGO_URI` with the correct value
3. Run `npm start` locally
4. Verify the connection works

## Need Help?
If you're still having issues:
1. Double-check the connection string format
2. Verify your MongoDB credentials
3. Check if your IP is whitelisted in MongoDB Atlas
4. Make sure the database name exists
