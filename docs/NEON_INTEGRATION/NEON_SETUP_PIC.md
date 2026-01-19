# 🚀 NEON INTEGRATION IMPLEMENTATION CHECKLIST

## Phase 1: Neon Setup (5-10 minutes)

### Create Neon Project
- [ ] Go to https://console.neon.tech
- [ ] Sign in / Create account
- [ ] Create new project:
  - [ ] Project name: `deltaindo-pic`
  - [ ] Database name: `pic_prod`
  - [ ] PostgreSQL version: 17
  - [ ] Region: Singapore (or nearest to Indonesia)
- [ ] Click "Create project" and wait for setup

### Get Connection Strings
- [ ] Navigate to project → Connection Details
- [ ] Copy **Pooled Connection String** (for DATABASE_URL):
  ```
  postgresql://[user]:[password]@[project-name]-pooler.neon.tech:6432/pic_prod?sslmode=require
  ```
- [ ] Copy **Direct Connection String** (for DIRECT_URL):
  ```
  postgresql://[user]:[password]@[project-name].neon.tech:5432/pic_prod?sslmode=require
  ```
- [ ] Save both strings securely (password manager or secure note)

---

## Phase 2: Local Development Setup (10-15 minutes)

### Update Prisma Schema
- [ ] Open `packages/database/prisma/schema.prisma`
- [ ] Add `directUrl` line:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")  # ← ADD THIS LINE
  }
  ```
- [ ] Save file

### Update Environment Files
- [ ] Open `.env.example`
- [ ] Add:
  ```bash
  DIRECT_URL="postgresql://...-pooler.neon.tech:6432/pic_prod?sslmode=require"
  ```
- [ ] Commit `.env.example`

- [ ] Create/Update `.env.local` (DO NOT COMMIT)
- [ ] Add both Neon URLs:
  ```bash
  DATABASE_URL="your-pooled-url-from-neon"
  DIRECT_URL="your-direct-url-from-neon"
  ```
- [ ] Verify `.gitignore` includes `.env.local`

### Generate Prisma Client
```bash
cd packages/database
npx prisma generate
```
- [ ] Verify no errors
- [ ] Check `node_modules/@prisma/client` updated

### Run Migrations
```bash
npx prisma migrate deploy
```
- [ ] Verify output: "Already up to date" or "Applied X migrations"
- [ ] Check for errors

### Seed Initial Data
```bash
npx prisma db seed
```
- [ ] Verify seeds applied:
  - [ ] Admin user created
  - [ ] Bidang/Training data populated
  - [ ] Other seed data inserted

### Verify Connection
```bash
# Connect to Neon and list tables
psql $DATABASE_URL -c "\dt"
```
- [ ] See list of tables (not error)
- [ ] Verify tables exist: admin, trainingProgram, personnelType, etc.

---

## Phase 3: Local Testing (10-15 minutes)

### Start Backend
```bash
cd apps/picnew-backend
npm run dev
```
- [ ] Server starts on http://localhost:5001
- [ ] No database connection errors
- [ ] Check console for "Connected to Neon"

### Start Frontend (New Terminal)
```bash
cd apps/picnew-frontend
npm run dev
```
- [ ] Frontend starts on http://localhost:3000
- [ ] No build errors

### Test Login
- [ ] Open http://localhost:3000/login
- [ ] Enter credentials:
  - [ ] Email: `admin@deltaindo.co.id`
  - [ ] Password: `Admin123#` (your seed password)
- [ ] Click Login
- [ ] Verify:
  - [ ] Login succeeds
  - [ ] Redirected to dashboard
  - [ ] Can view registrations
  - [ ] Can view programs

### Test Core Features
- [ ] View Dashboard
- [ ] View Registrations list
- [ ] View Training Programs
- [ ] Create new registration (if applicable)
- [ ] No database errors in console

### Check Performance
- [ ] Pages load quickly
- [ ] No noticeable latency from Neon
- [ ] API responses reasonable (~100-500ms)

---

## Phase 4: Production Deployment (10-15 minutes)

### Configure Vercel
- [ ] Go to Vercel Dashboard → picnew project
- [ ] Navigate to Settings → Environment Variables
- [ ] Add variables (use Neon URLs from Phase 1):
  - [ ] `DATABASE_URL` = Neon pooled URL
  - [ ] `DIRECT_URL` = Neon direct URL
  - [ ] `JWT_SECRET` = your secret (or generate new)
  - [ ] Any other env vars from `.env.local`
- [ ] Save all variables

### Deploy to Production
- [ ] Push changes to main branch:
  ```bash
  git add .
  git commit -m "chore: integrate Neon PostgreSQL"
  git push origin main
  ```
- [ ] Vercel auto-deploys
- [ ] Watch deployment progress in Vercel dashboard
- [ ] Verify deployment succeeds (green checkmark)

### Verify Production
- [ ] Go to production URL
- [ ] Try login with:
  - [ ] Email: `admin@deltaindo.co.id`
  - [ ] Password: `Admin123#`
- [ ] Verify:
  - [ ] Login works
  - [ ] Dashboard loads
  - [ ] Data displays correctly
  - [ ] No "connection" errors

### Check Neon Connection
```bash
# From command line, test production connection
psql "postgresql://[user]:[password]@[project]-pooler.neon.tech:6432/pic_prod?sslmode=require" \
  -c "SELECT COUNT(*) FROM \"Admin\";"
```
- [ ] Returns row count (1 or more)
- [ ] No connection errors

---

## Phase 5: Cleanup & Documentation (5 minutes)

### Update Documentation
- [ ] Update README.md with Neon setup instructions
- [ ] Document new env vars needed
- [ ] Add troubleshooting section

### Verify .gitignore
- [ ] Confirm `.env.local` in `.gitignore`
- [ ] Confirm `.env.production.local` (if used) in `.gitignore`
- [ ] No secrets in repository

### Monitor Neon Usage
- [ ] Check Neon console for activity
- [ ] Verify connections working
- [ ] Check storage usage

### Create Backup
- [ ] Export Neon connection strings to secure location
- [ ] Document for team members
- [ ] Share with DevOps team

---

## Phase 6: Remove Old Infrastructure (Optional)

### Docker Compose Cleanup
- [ ] Once verified in production, update `docker-compose.yml`
- [ ] Remove `postgres` service (no longer needed)
- [ ] Keep backend and frontend services
- [ ] Update documentation

### Local Development
- [ ] Stop local PostgreSQL container:
  ```bash
  docker-compose down postgres
  ```
- [ ] Or remove entire docker-compose if not needed locally

---

## ⚠️ COMMON ISSUES & FIXES

### Issue: "P1000: Can't reach database server"
- [ ] Verify connection string is correct
- [ ] Check Neon project is active
- [ ] Try connecting with `psql` directly
- [ ] Restart dev server

### Issue: "P3014: Could not find `_prisma_migrations` table"
- [ ] Run: `npx prisma migrate deploy`
- [ ] This creates the migrations table

### Issue: Login returns 401 Unauthorized
- [ ] Verify admin user was seeded: `npx prisma studio`
- [ ] Check password is exactly `Admin123#`
- [ ] Verify no typos in email

### Issue: "Connection pool limit exceeded"
- [ ] Normal if using many connections
- [ ] Check Neon dashboard for connection limits
- [ ] Consider increasing pool size

---

## 🎯 VERIFICATION CHECKLIST

### Before Deployment
- [ ] Local login works
- [ ] Dashboard loads
- [ ] No console errors
- [ ] Database queries respond quickly
- [ ] Neon connection active in console

### After Deployment
- [ ] Production login works
- [ ] Production dashboard loads
- [ ] Data persists correctly
- [ ] No database errors in logs
- [ ] Performance acceptable

### Success Criteria
- [ ] ✅ Neon project created and active
- [ ] ✅ Connection strings obtained
- [ ] ✅ Prisma schema updated
- [ ] ✅ Migrations applied successfully
- [ ] ✅ Seed data populated
- [ ] ✅ Local login works
- [ ] ✅ Production deployment successful
- [ ] ✅ Production login works
- [ ] ✅ Data accessible and responsive

---

## 📞 SUPPORT

### If You Get Stuck
1. Check 03-ANALYSIS.md for detailed explanation
2. Review troubleshooting section above
3. Check Neon dashboard for connection status
4. Try connecting with `psql` directly to test connection
5. Check `.env.local` has correct connection strings

### Resources
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GitHub: PICNew Repository](https://github.com/deltaindo/all-in-one)

---

## ✅ FINAL SIGN-OFF

- [ ] All phases completed
- [ ] All tests passing
- [ ] Production verified
- [ ] Team notified
- [ ] Documentation updated
- [ ] Ready for use! 🚀

---

**Estimated Total Time**: ~45 minutes  
**Complexity**: Very Easy  
**Risk Level**: Low  
**Go/No-Go**: ✅ **READY TO GO**

**Start Date**: ____________  
**Completion Date**: ____________  
**Completed By**: ____________  

---

Last Updated: January 19, 2026
