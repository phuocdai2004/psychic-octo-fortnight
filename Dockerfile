# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files (exclude frontend)
COPY config ./config
COPY constants ./constants
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY services ./services
COPY scripts ./scripts
COPY server.js .

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "server.js"]
