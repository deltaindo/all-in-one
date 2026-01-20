# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install required build tools
RUN apk add --no-cache openssl netcat-openbsd python3 make g++

# Copy root files
COPY package*.json turbo.json ./

# Copy packages and apps
COPY packages ./packages
COPY apps ./apps

# Install dependencies
RUN npm ci

# Build all packages
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl netcat-openbsd dumb-init

# Set environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/apps/picnew-backend/dist ./apps/picnew-backend/dist
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/picnew-backend/dist ./apps/picnew-backend/dist
COPY --from=builder /app/apps/picnew-backend/package.json ./apps/picnew-backend/
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps ./apps

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

# Use dumb-init to handle signals properly
ENTRYPOINT ["/entrypoint.sh"]