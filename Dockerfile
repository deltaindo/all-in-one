# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install required build tools
RUN apk add --no-cache openssl netcat-openbsd python3 make g++

# Copy root files FIRST
COPY package*.json turbo.json tsconfig.json ./

# Copy packages and apps
COPY packages ./packages
COPY apps ./apps

# Install ALL dependencies (including dev) - this populates node_modules
RUN npm ci --legacy-peer-deps

# Build using turbo - handles all dependencies and build order
RUN npm run build

# Verify backend dist was created
RUN if [ ! -d /app/apps/picnew-backend/dist ]; then \
      echo "ERROR: Backend dist folder not created!"; \
      echo "Checking what was built:"; \
      find /app -type d -name dist 2>/dev/null | head -20; \
      exit 1; \
    fi && \
    echo "✅ Turbo build completed - backend dist ready"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl netcat-openbsd dumb-init

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy backend build from builder
COPY --from=builder /app/apps/picnew-backend/dist ./apps/picnew-backend/dist
COPY --from=builder /app/apps/picnew-backend/package.json ./apps/picnew-backend/

# Copy database package (needed for Prisma)
COPY --from=builder /app/packages/database ./packages/database

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Copy entrypoint script
COPY entrypoint-script.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["/entrypoint.sh"]