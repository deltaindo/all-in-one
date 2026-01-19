# 📁 FILES TO UPDATE IN PICNEW REPO

**Use this guide to update your repository files with Neon integration**

---

## FILE 1: `.env.example` (COMMIT THIS)

**Location**: Root directory  
**Action**: Replace or update existing file  

**Complete Content**:
```bash
# ============================================
# DATABASE CONFIGURATION (Neon PostgreSQL)
# ============================================
# Neon Pooled Connection (for app runtime)
DATABASE_URL="postgresql://[user]:[password]@[project-name]-pooler.neon.tech:6432/pic_prod?sslmode=require"

# Neon Direct Connection (for migrations)
DIRECT_URL="postgresql://[user]:[password]@[project-name].neon.tech:5432/pic_prod?sslmode=require"

# ============================================
# JWT & AUTHENTICATION
# ============================================
JWT_SECRET="generate-a-random-secret-with-openssl-rand-base64-32"
NEXTAUTH_SECRET="generate-a-random-secret-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:5001"
NODE_ENV="development"

# ============================================
# NOTES
# ============================================
# - Do NOT commit .env.local to Git
# - Replace [user], [password], [project-name] with actual Neon values
# - Get credentials from: https://console.neon.tech
# - Generate secrets with: openssl rand -base64 32
```

**Command to Commit**:
```bash
git add .env.example
git commit -m "docs: update .env.example with Neon PostgreSQL configuration"
```

---

## FILE 2: `.env.local` (DO NOT COMMIT)

**Location**: Root directory  
**Action**: Create new local file (add to .gitignore)

**TEMPLATE** (fill in your values):
```bash
# ============================================
# DATABASE - FILL IN FROM NEON CONSOLE
# ============================================
# Get from: https://console.neon.tech → Your Project → Connection Details

DATABASE_URL="paste-your-pooled-connection-string-here"
DIRECT_URL="paste-your-direct-connection-string-here"

# ============================================
# JWT & AUTHENTICATION - GENERATE NEW
# ============================================
# Generate with: openssl rand -base64 32

JWT_SECRET="paste-a-random-secret-here"
NEXTAUTH_SECRET="paste-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# API CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL="http://localhost:5001"
NODE_ENV="development"
```

**Verify `.gitignore` has**:
```bash
# Check root .gitignore includes:
.env.local
.env.*.local
.env.production.local
```

---

## FILE 3: `packages/database/prisma/schema.prisma` (COMMIT THIS)

**Location**: `packages/database/prisma/schema.prisma`  
**Action**: Update existing file (add one line)

**FIND THIS SECTION**:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**REPLACE WITH THIS**:
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

**Command to Commit**:
```bash
git add packages/database/prisma/schema.prisma
git commit -m "chore: add directUrl to Prisma datasource for Neon optimization"
```

---

## COMMIT SUMMARY

**These files need to be committed to Git**:

```bash
# 1. Update .env.example with Neon template
git add .env.example

# 2. Update Prisma schema with directUrl
git add packages/database/prisma/schema.prisma

# 3. Update README.md with database docs
git add README.md

# 4. Commit all together
git commit -m "feat: integrate Neon PostgreSQL database

- Add directUrl to Prisma datasource
- Update .env.example with Neon configuration
- Update README with database setup instructions
- Support pooled (runtime) and direct (migrations) connections

Related: docs/NEON_INTEGRATION/"

# 5. Push to remote
git push origin main
```

---

## VERIFICATION CHECKLIST

- [ ] Neon project created (deltaindo-pic)
- [ ] Connection strings obtained (both pooled & direct)
- [ ] `.env.local` created with credentials
- [ ] `.env.example` updated and committed
- [ ] `schema.prisma` updated with directUrl
- [ ] `prisma generate` succeeded
- [ ] `prisma migrate deploy` succeeded
- [ ] `prisma db seed` succeeded
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Local login works
- [ ] Vercel env vars added (5 variables)
- [ ] Code pushed to main
- [ ] Production deployment succeeded
- [ ] Production login works

---

**Status**: ✅ Ready to implement  
**Time**: ~45 minutes  
**Complexity**: Very Easy  

Last Updated: January 19, 2026, 3:01 PM +07
