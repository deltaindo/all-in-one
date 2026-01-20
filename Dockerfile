# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install required build tools
RUN apk add --no-cache openssl netcat-openbsd python3 make g++

# Update npm to support workspace protocol
RUN npm install -g npm@latest

# Copy root files
COPY package*.json turbo.json tsconfig.json ./

# Copy packages and apps
COPY packages ./packages
COPY apps ./apps

# Install ALL dependencies
RUN npm ci --legacy-peer-deps

# Build using turbo
RUN npm run build

# Verify dist was created
RUN if [ ! -d apps/picnew-backend/dist ]; then echo "ERROR: dist not created"; find apps/picnew-backend -type f | head -20; exit 1; fi && echo "✅ Build successful"

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl netcat-openbsd dumb-init

# Update npm in production image too
RUN npm install -g npm@latest

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