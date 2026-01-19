# 🔧 NEON INTEGRATION: FILL-IN TEMPLATE

**Date**: January 19, 2026  
**Project**: PICNew  
**Status**: Ready to configure  

---

## 📋 STEP 1: CREATE NEON PROJECT & COLLECT CREDENTIALS

### 1.1 Go to Neon Console

```
1. Open: https://console.neon.tech
2. Sign in or create account
3. Create new project:
   - Project name: deltaindo-pic
   - Database name: pic_prod
   - PostgreSQL version: 17
   - Region: Singapore (or nearest to Indonesia)
4. Wait for project creation to complete
```

### 1.2 Get Connection Strings from Neon

After project is created:

```
1. Click on your project: deltaindo-pic
2. Go to: Connection Details (or Get Connection String)
3. You'll see two options - copy both
```

**FILL IN BELOW:**

```
📌 POOLED CONNECTION STRING (for DATABASE_URL - for app runtime)
────────────────────────────────────────────────────────────────
Source: Neon Console → Connection Details → "Pooled"

DATABASE_URL=""


📌 DIRECT CONNECTION STRING (for DIRECT_URL - for migrations)
────────────────────────────────────────────────────────────────
Source: Neon Console → Connection Details → "Direct"

DIRECT_URL=""


📝 NOTE: These strings look like:
DATABASE_URL="postgresql://[user]:[password]@[project-name]-pooler.neon.tech:6432/pic_prod?sslmode=require"
DIRECT_URL="postgresql://[user]:[password]@[project-name].neon.tech:5432/pic_prod?sslmode=require"
```

---

## 📝 STEP 2: UPDATE `.env.example` (COMMIT THIS)

**File Path**: `.env.example` in project root

**Current Content** (if exists):
```bash
# DATABASE_URL=postgresql://user:password@localhost:5432/picnew
```

**Update To** (copy and replace):
```bash
# ============================================
# DATABASE CONFIGURATION (Neon PostgreSQL)
# ============================================
# Neon Pooled Connection (for app runtime)
DATABASE_URL="postgresql://[user]:[password]@[project-name]-pooler.neon.tech:6432/pic_prod?sslmode=require"

# Neon Direct Connection (for migrations)
DIRECT_URL="postgresql://[user]:[password]@[project-name].neon.tech:5432/pic_prod?sslmode=require"

# ============================================
# JWT & AUTH
# ============================================
JWT_SECRET="generate-a-random-secret-here"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:5001"
NODE_ENV="development"
```

**THEN COMMIT** to Git:
```bash
git add .env.example
git commit -m "docs: add Neon PostgreSQL env template"
```

---

## 🔐 STEP 3: CREATE `.env.local` (DO NOT COMMIT)

**File Path**: `.env.local` in project root  
**Important**: This file should be in `.gitignore` - NEVER commit this!

**Create New File** with your Neon credentials:

```bash
# ============================================
# 🔴 FILL IN WITH YOUR NEON CREDENTIALS BELOW
# ============================================

# Copy from Neon Console - Connection Details
# Replace [user], [password], [project-name] with actual values
DATABASE_URL="paste-your-pooled-url-here"
DIRECT_URL="paste-your-direct-url-here"

# ============================================
# JWT SECRETS (generate new ones)
# ============================================
# Generate with: openssl rand -base64 32
JWT_SECRET="your-random-jwt-secret-here"
NEXTAUTH_SECRET="your-random-nextauth-secret-here"

# ============================================
# URLS
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5001"
NODE_ENV="development"
```

**Verify `.gitignore` has** (in project root):
```bash
.env.local
.env.*.local
.env.production.local
```

---

## 🔧 STEP 4: UPDATE PRISMA SCHEMA

**File Path**: `packages/database/prisma/schema.prisma`

**Find This Section**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Replace With**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**THEN COMMIT**:
```bash
git add packages/database/prisma/schema.prisma
git commit -m "chore: add directUrl to Prisma schema for Neon"
```

---

## 🚀 STEP 5: RUN MIGRATIONS & SEED DATA

**In your terminal**, run these commands in order:

### 5.1 Generate Prisma Client
```bash
cd packages/database
npx prisma generate
```

### 5.2 Deploy Migrations to Neon
```bash
npx prisma migrate deploy
```

### 5.3 Seed Initial Data
```bash
npx prisma db seed
```

### 5.4 Verify Connection
```bash
psql $DATABASE_URL -c "\dt"
```

---

## 🧪 STEP 6: TEST LOCALLY

### 6.1 Start Backend

**Terminal 1**:
```bash
cd apps/picnew-backend
npm run dev
```

### 6.2 Start Frontend

**Terminal 2**:
```bash
cd apps/picnew-frontend
npm run dev
```

### 6.3 Test Login

1. Open: http://localhost:3000/login
2. Enter credentials:
   - **Email**: `admin@deltaindo.co.id`
   - **Password**: `Admin123#`
3. Click Login
4. Verify dashboard loads

---

## 🌐 STEP 7: SETUP PRODUCTION (VERCEL)

### 7.1 Add Environment Variables to Vercel

**In Vercel Dashboard**:

```
1. Go to: https://vercel.com
2. Open your PICNew project
3. Go to: Settings → Environment Variables
4. Add the following variables:
```

| Variable | Value |
|----------|-------|
| DATABASE_URL | [paste your pooled URL] |
| DIRECT_URL | [paste your direct URL] |
| JWT_SECRET | [your-jwt-secret] |
| NEXTAUTH_SECRET | [your-nextauth-secret] |
| NEXTAUTH_URL | https://[your-domain] |

### 7.2 Deploy to Production

**In your terminal**:
```bash
git add .
git commit -m "chore: integrate Neon PostgreSQL"
git push origin main
```

### 7.3 Test Production Login

1. Open your production URL
2. Go to `/login`
3. Enter: admin@deltaindo.co.id / Admin123#
4. Verify dashboard loads

---

## ✅ NEXT STEPS

1. **Get Neon Credentials** (from console.neon.tech)
2. **Fill in `.env.local`** with your credentials
3. **Update `.env.example`** and commit
4. **Update Prisma schema** and commit
5. **Run migrations & seed** locally
6. **Test locally** (login works?)
7. **Configure Vercel** env vars
8. **Deploy to production**
9. **Test production** (login works?)
10. **Done!** 🚀

---

**Estimated Total Time**: ~45 minutes  
**Complexity**: Very Easy  
**Ready?**: Let's go! 🚀

Last Updated: January 19, 2026, 3:01 PM +07
