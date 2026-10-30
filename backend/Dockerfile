
# Lightweight Node.js Alpine image
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Upgrade OS packages to pick up security fixes (OpenSSL)
RUN apk upgrade --no-cache

# Keep curl because the Docker health check uses it
RUN apk add --no-cache curl

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application files with correct ownership
COPY --chown=node:node . .

# Run the application without root privileges
USER node

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]

