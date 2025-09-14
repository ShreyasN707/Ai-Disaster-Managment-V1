# AI Disaster Management Backend (Node.js + Express + MongoDB)

Secure, modular, production-ready backend with JWT auth, role-based access (Admin, Operator, Public), real-time alerts via Socket.IO, and ML integration hooks. Includes a simple static frontend (for demo) to view alerts.

## Features
- Auth: JWT, password hashing (bcrypt), role-based middleware
- Data: MongoDB (Mongoose)
- Real-time: Socket.IO alerts + operator acknowledgements
- Security: Helmet, CORS, XSS Clean, Rate Limiting, Mongo Sanitize
- Validation: Joi schemas
- Error Handling: Centralized
- ML Ready: `/services/mlService.js` abstraction (dummy for now)
- Export: Reports to PDF/Excel (stub content)

## Getting Started

1. Install dependencies
```bash
npm install
```

2. Configure environment
```bash
cp .env.example .env
# edit .env values as needed
```

3. Run the server
```bash
npm run dev
# or
npm start
```

The server runs at `http://localhost:4000` by default and serves a demo UI at `/`.

## API Overview
- Public
  - GET `/api/public/alerts`
  - GET `/api/public/info`
  - POST `/api/public/subscribe`
- Auth
  - POST `/api/auth/register` (requires ADMIN_REGISTRATION_CODE)
  - POST `/api/auth/login`
  - GET `/api/auth/me`
- Admin (JWT + role: ADMIN)
  - GET `/api/admin/dashboard`
  - POST `/api/admin/alerts`
  - PUT `/api/admin/alerts/:id`
  - GET `/api/admin/reports`
  - GET `/api/admin/reports/export?format=pdf|excel`
- Operator (JWT + role: OPERATOR)
  - GET `/api/operator/dashboard`
  - POST `/api/operator/acknowledge`
  - POST `/api/operator/sensors`
  - PUT `/api/operator/sensors/:id`
  - POST `/api/operator/incidents` (multipart/form-data)

## Notes
- The ML service is a stub. Integrate your ML API in `src/services/mlService.js`.
- File uploads are stored to `uploads/` (configurable via `UPLOAD_DIR`).
- Use the admin registration code to create the first admin via `/api/auth/register`.
