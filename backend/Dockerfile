# ─── TaskFlow Backend Dockerfile ───────────────────────────────────────────────
# Multi-stage / lightweight Node.js 20 Alpine Linux image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Install curl for container health check probes
RUN apk add --no-cache curl

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev || npm install --omit=dev

# Copy backend application source code
COPY . .

# Expose internal Express port
EXPOSE 5000

# Container-level health check (verifies HTTP 200 and MongoDB Atlas connection)
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Express server
CMD ["npm", "start"]
