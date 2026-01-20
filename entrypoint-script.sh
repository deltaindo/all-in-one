#!/bin/bash
set -e

echo "============================================"
echo "🚀 PICNew Backend Startup Script"
echo "============================================"

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
MAX_ATTEMPTS=30
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✅ Database is ready!"
    break
  fi
  
  echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for $DB_HOST:$DB_PORT..."
  sleep 2
  ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -gt $MAX_ATTEMPTS ]; then
  echo "❌ Database failed to start after $MAX_ATTEMPTS attempts"
  exit 1
fi

# Change to database package directory
cd packages/database

# Step 1: Generate Prisma Client
echo ""
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

# Step 2: Run Migrations
echo ""
echo "🔄 Step 2: Running Database Migrations..."
npx prisma migrate deploy

# Step 3: Check if seed has already been run
echo ""
echo "🌱 Step 3: Checking if seeding is needed..."

# Create a marker file to track if we've seeded
SEED_MARKER="/app/.seeded"

if [ ! -f "$SEED_MARKER" ]; then
  echo "💾 Seeding database with master data..."
  node prisma/seed.js
  
  # Mark as seeded
  touch "$SEED_MARKER"
  echo "✅ Database seeded successfully!"
else
  echo "⏭️  Database already seeded, skipping..."
fi

# Back to app root
cd /app

# Step 4: Start Application
echo ""
echo "🚀 Starting PICNew Backend..."
exec node apps/picnew-backend/dist/index.js