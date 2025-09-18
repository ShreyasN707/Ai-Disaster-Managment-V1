# Multi-stage Docker build for AI Disaster Management System

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
COPY frontend/bun.lockb* ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build backend and final image
FROM node:18-alpine AS production

# Install system dependencies for sharp and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy backend source code
COPY src/ ./src/
COPY train_and_export.py ./
COPY .env.example ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p uploads tfjs_model logs && \
    chown -R nodejs:nodejs /app

# Copy build scripts
COPY scripts/ ./scripts/
RUN chmod +x scripts/*.js

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]

# Metadata
LABEL maintainer="AI Disaster Management Team"
LABEL version="1.0.0"
LABEL description="AI-powered disaster management system with landslide prediction"
