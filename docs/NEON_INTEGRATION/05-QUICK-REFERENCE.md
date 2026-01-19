# ⚡ QUICK REFERENCE CARD

---

## 🔧 KEY COMMANDS

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to Neon
npx prisma migrate deploy

# Seed initial data
npx prisma db seed

# Test Neon connection
psql $DATABASE_URL -c "\dt"

# Start backend
cd apps/picnew-backend && npm run dev

# Start frontend
cd apps/picnew-frontend && npm run dev

# Commit changes
git add .env.example packages/database/prisma/schema.prisma README.md
git commit -m "feat: integrate Neon PostgreSQL database"
git push origin main
```

---

## 📋 WHAT TO FILL IN

### From Neon Console
```
DATABASE_URL = postgresql://[user]:[password]@[project]-pooler.neon.tech:6432/pic_prod?sslmode=require
DIRECT_URL = postgresql://[user]:[password]@[project].neon.tech:5432/pic_prod?sslmode=require
```

### Generate Locally
```bash
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### Files to Update
```
✅ .env.example (add DATABASE_URL + DIRECT_URL)
✅ .env.local (fill in Neon credentials)
✅ packages/database/prisma/schema.prisma (add directUrl)
```

---

## ✅ QUICK CHECKLIST

- [ ] Neon project created
- [ ] Connection strings copied
- [ ] .env.local created
- [ ] .env.example updated
- [ ] schema.prisma updated
- [ ] Migrations run
- [ ] Local login works
- [ ] Vercel env vars added
- [ ] Production deployed
- [ ] Production login works

---

## 🔗 IMPORTANT LINKS

```
Neon Console:      https://console.neon.tech
Vercel Dashboard:  https://vercel.com/dashboard
Local Dev:         http://localhost:3000 (frontend)
Local Dev:         http://localhost:5001 (backend)
Local Login:       http://localhost:3000/login
```

---

## ⏱️ 45-MINUTE ROADMAP

```
5 min   → Neon: Create project
2 min   → Local: Create .env.local
5 min   → Update: 3 files
5 min   → Database: Run migrations
10 min  → Test: Backend + Frontend
5 min   → Vercel: Add env vars
5 min   → Deploy: Push & verify
```

---

## 🆘 COMMON PROBLEMS & FIXES

❌ "P1000: Can't reach database server"  
✅ Verify connection string in .env.local → Restart dev server

❌ "P3014: Could not find `_prisma_migrations` table"  
✅ Run: `npx prisma migrate deploy`

❌ "Login returns 401 Unauthorized"  
✅ Check admin user exists → Verify password

❌ "Vercel deployment failed"  
✅ Check env vars present → Review build logs

---

## 📊 PROJECT STATUS

✅ Analysis: Complete  
✅ Guide Quality: Excellent  
✅ Implementation Ready: Yes  
✅ Time: ~45 minutes  
✅ Difficulty: Very Easy  
✅ Risk: Low  
✅ Decision: GO!  

---

Last Updated: January 19, 2026
