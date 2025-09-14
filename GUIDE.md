# AI Disaster Management Backend Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Project Structure](#project-structure)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Real-time Communication](#real-time-communication)
6. [ML Integration](#ml-integration)
7. [Map Overlays](#map-overlays)
8. [Data Flow](#data-flow)
9. [Remaining Tasks](#remaining-tasks)
10. [Production Deployment](#production-deployment)

## System Overview

A secure, scalable backend for disaster management with three user roles:
- **Public**: View alerts and safety info
- **Operator**: Manage sensors and acknowledge alerts
- **Admin**: Full system control and reporting

## Project Structure

```
src/
├── config/           # Configuration files
├── controllers/      # Route handlers
├── middlewares/      # Express middlewares
├── models/           # MongoDB schemas
├── public/           # Demo frontend
├── routes/           # API route definitions
├── services/         # Business logic
├── utils/            # Helper functions
├── app.js            # Express app setup
└── server.js         # Server entry point
```

## Authentication Flow

1. **Registration**
   - POST `/api/auth/register`
   - Requires `adminCode` for ADMIN role
   - Hashes password with bcrypt

2. **Login**
   - POST `/api/auth/login`
   - Returns JWT token
   - Token stored in client's localStorage

3. **Protected Routes**
   - Add header: `Authorization: Bearer <token>`
   - Role-based access control in `middlewares/auth.js`

## API Endpoints

### Public
- `GET /api/public/alerts` - Active alerts + risk level
- `GET /api/public/info` - Safety info and contacts
- `POST /api/public/subscribe` - Subscribe for alerts

### Admin (Requires JWT + ADMIN role)
- `GET /api/admin/dashboard` - System overview
- `POST /api/admin/alerts` - Create alerts
- `GET /api/admin/reports` - Generate reports
- `GET /api/admin/reports/export` - Export reports (PDF/Excel)

### Operator (Requires JWT + OPERATOR role)
- `GET /api/operator/dashboard` - Assigned sensors
- `POST /api/operator/acknowledge` - Acknowledge alerts
- `POST /api/operator/sensors` - Add sensors
- `POST /api/operator/incidents` - Report incidents with media

## Real-time Communication

### Socket.IO Events
- **alert:new** - When admin creates an alert
  ```javascript
  socket.on('alert:new', (alert) => {
    console.log('New alert:', alert);
  });
  ```

- **alert:acknowledged** - When operator acknowledges
  ```javascript
  socket.on('alert:acknowledged', (data) => {
    console.log('Alert acknowledged:', data);
  });
  ```

## ML Integration

### Current Implementation (Dummy)
Located in `services/mlService.js`:
- `getRiskPrediction(sensorData)` - Returns risk level based on sensor status
- `getRiskOverlay(bounds)` - Returns GeoJSON for map overlays

### Integration Steps
1. **Replace ML Service**
   - Update `services/mlService.js` to call your ML API
   - Example REST implementation:
   ```javascript
   async function getRiskPrediction(sensorData) {
     const response = await fetch('YOUR_ML_API_URL/predict', {
       method: 'POST',
       body: JSON.stringify(sensorData)
     });
     return response.json();
   }
   ```

2. **Environment Variables**
   Add to `.env`:
   ```
   ML_API_URL=http://your-ml-service:5000
   ML_API_KEY=your_api_key
   ```

## Map Overlays

### Current Implementation
- Dummy GeoJSON in `services/mlService.js`
- Returns risk zones as GeoJSON features

### Integration with Frontend
1. **Frontend Implementation**
   ```javascript
   // Example using Leaflet
   fetch('/api/admin/dashboard')
     .then(res => res.json())
     .then(data => {
       L.geoJSON(data.overlay, {
         style: (feature) => ({
           color: getColor(feature.properties.risk),
           fillOpacity: 0.5
         })
       }).addTo(map);
     });
   ```

2. **Real Updates**
   - Call `mlService.getRiskOverlay()` with map bounds
   - Cache results based on location/timestamp
   - Update when:
     - New sensor data arrives
     - User pans/zooms map
     - Manual refresh

## Data Flow

1. **Alert Creation**
   ```mermaid
   sequenceDiagram
     Admin->>+Backend: POST /api/admin/alerts
     Backend->>+DB: Save alert
     Backend->>+Socket: emit('alert:new')
     Frontend->>+Socket: Listen for 'alert:new'
   ```

2. **Sensor Data Processing**
   ```mermaid
   sequenceDiagram
     Sensor->>+Backend: POST /api/ingest (not implemented)
     Backend->>+ML Service: getRiskPrediction()
     ML Service-->>-Backend: Risk level
     Backend->>+DB: Update sensor status
     Backend->>+Socket: emit('sensor:update')
   ```

## Remaining Tasks

### 1. ML Service Integration
- [ ] Implement `getRiskPrediction()` in `mlService.js`
- [ ] Add data preprocessing for ML input
- [ ] Handle ML service failures gracefully

### 2. Sensor Ingestion API
```javascript
// routes/api/ingest.js
router.post('/ingest', async (req, res) => {
  const { sensorId, data } = req.body;
  await Sensor.updateOne({ sensorId }, { $push: { readings: data } });
  const risk = await mlService.getRiskPrediction(data);
  if (risk.level === 'critical') {
    await Alert.create({ /* ... */ });
    socketService.emitAlert(alert);
  }
  res.status(202).send();
});
```

### 3. Map Overlay Generation
- [ ] Implement dynamic GeoJSON generation
- [ ] Add caching for overlay data
- [ ] Implement spatial queries for sensor data

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secure_secret
ADMIN_REGISTRATION_CODE=change_in_production
UPLOAD_DIR=/var/uploads
```

### Deployment Steps
1. **Database**
   - Set up MongoDB Atlas or self-hosted
   - Enable authentication
   - Configure backups

2. **Server**
   ```bash
   # Install dependencies
   npm install --production
   
   # Start server with PM2
   pm2 start src/server.js --name disaster-api
   ```

3. **Nginx Configuration**
   ```nginx
   server {
     listen 80;
     server_name api.yourdomain.com;
     
     location / {
       proxy_pass http://localhost:4000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

4. **SSL**
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d api.yourdomain.com
   ```

## Troubleshooting

1. **Socket.IO Connection Issues**
   - Verify CORS settings in `socketService.js`
   - Check WebSocket support in your environment

2. **ML Service Integration**
   - Test ML API independently first
   - Add request/response logging

3. **Performance**
   - Implement Redis caching for frequent queries
   - Add database indexing for common queries

## Support
For issues, please open an issue on GitHub or contact support@example.com
