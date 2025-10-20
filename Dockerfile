# Backend API Dockerfile for Render Deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application files (backend only - frontend removed)
COPY config ./config
COPY constants ./constants
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY services ./services
COPY scripts ./scripts
COPY server.js .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Render will use PORT environment variable)
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/auth/login', (r) => {process.exit(r.statusCode === 200 || r.statusCode === 401 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
