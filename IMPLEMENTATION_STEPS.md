# PIC App Integration - Implementation Steps

## Phase 1: Framework Setup ✅ COMPLETE

Done:
- [x] Create `feature/pic-app-integration` branch
- [x] Create `apps/pic/` directory structure
- [x] Create root `apps/pic/package.json`
- [x] Create `apps/pic/README.md` with full documentation
- [x] Create `apps/pic/backend/.env.example` with all variables
- [x] Create `apps/pic/backend/Dockerfile` for production
- [x] Create configuration files

## Phase 2: Copy Backend Files from picnew

Next steps - Clone/copy from https://github.com/deltaindo/picnew branch `automated-migration`:

### Backend Source Files
```
picnew/backend/
  ├── prisma/
  │   ├── schema.prisma          → apps/pic/backend/prisma/
  │   ├── migrations/            → apps/pic/backend/prisma/
  │   ├── auto-seed.ts          → apps/pic/backend/prisma/
  │   ├── seed.ts               → apps/pic/backend/prisma/
  │   └── seeders/              → apps/pic/backend/prisma/
  ├── routes/                → apps/pic/backend/
  ├── middleware/            → apps/pic/backend/
  ├── server.js              → apps/pic/backend/
  ├── db.js                  → apps/pic/backend/
  └── package.json           (merge with existing)
```

### Commands to Execute

```bash
# From all-in-one repo on feature/pic-app-integration branch

# Copy prisma files
cp -r ../picnew/backend/prisma/* apps/pic/backend/prisma/

# Copy route files
cp -r ../picnew/backend/routes/* apps/pic/backend/routes/

# Copy middleware files
cp -r ../picnew/backend/middleware/* apps/pic/backend/middleware/

# Copy server files
cp ../picnew/backend/server.js apps/pic/backend/
cp ../picnew/backend/db.js apps/pic/backend/
```

## Phase 3: Update Backend package.json

Merge dependencies from picnew:
- Keep all existing dependencies
- Add missing: axios, bcrypt, multer, uuid
- Ensure @prisma/client version matches
- Update scripts section

## Phase 4: Frontend Integration (Optional)

If frontend is needed:

```bash
cp -r ../picnew/frontend/* apps/pic/frontend/
```

Create `apps/pic/frontend/package.json` with:
- React dependencies
- Build scripts
- Environment configuration

## Phase 5: Testing

Validate the integration:

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Check migrations
npm run db:migrate --help

# Test backend startup (dry run)
cd apps/pic/backend
npm install
node -e "console.log('✓ Node.js works')"
```

## Phase 6: Docker Composition

Update root `docker-compose.yml` to include:

```yaml
pic-backend:
  build:
    context: apps/pic/backend
    dockerfile: Dockerfile
  container_name: delta-pic-backend
  environment:
    - DATABASE_URL=postgresql://...
    - JWT_SECRET=...
    - NODE_ENV=production
    - FRONTEND_URL=...
  ports:
    - "5000:5000"
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - delta-network
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Phase 7: Database Configuration

Update root `docker-compose.yml` PostgreSQL section:

```yaml
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "-U deltauser"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    # Optional: seed SQL script
    # - ./scripts/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
```

## Phase 8: Root package.json Updates

Add PIC-specific scripts:

```json
{
  "scripts": {
    "pic:dev": "turbo run dev --filter=@delta/pic",
    "pic:build": "turbo run build --filter=@delta/pic",
    "pic:db:migrate": "cd apps/pic/backend && npm run prisma:migrate",
    "pic:db:seed": "cd apps/pic/backend && npm run prisma:seed"
  }
}
```

## Phase 9: Environment Setup

Create production environment files:

```bash
# Copy examples
cp apps/pic/backend/.env.example apps/pic/backend/.env.prod

# Edit with production values
vi apps/pic/backend/.env.prod
```

Required values for production:
- `DATABASE_URL`: Production PostgreSQL URL
- `JWT_SECRET`: Strong random string
- `FRONTEND_URL`: Production frontend URL
- `NODE_ENV`: production

## Phase 10: Final Verification

Before merge:

```bash
# 1. Check file structure
find apps/pic -type f -name '*.js' -o -name '*.json' | head -20

# 2. Verify package dependencies
cd apps/pic/backend && npm ls

# 3. Check Dockerfile
docker build -f apps/pic/backend/Dockerfile --dry-run

# 4. Lint and format
npm run lint
npm run format
```

## Merge to Main

When ready:

```bash
# Create pull request
git push origin feature/pic-app-integration

# After review:
# 1. Squash and merge to main
# 2. Tag as v1.0.0-pic
# 3. Create release notes
```

## Post-Merge Deployment

```bash
# Pull latest
git pull origin main

# Install dependencies
npm install

# Build Docker image
docker build -f apps/pic/backend/Dockerfile -t delta-pic-backend:latest apps/pic/backend

# Start services
docker-compose up -d

# Verify
curl http://localhost:5000/health
```

## Rollback Plan

If issues occur:

```bash
# Revert to previous main
git revert <commit-hash>

# Or checkout previous version
git checkout main
git reset --hard origin/main

# Restart services
docker-compose down
docker-compose up -d
```

## Notes

- Keep `picnew` repository as backup
- Use `.env.local` for development, `.env.prod` for production
- Test migrations thoroughly before production
- Auto-seeding runs on first startup only
- Database persists across container restarts

## Timeline

- **Phase 1**: ✅ Done
- **Phase 2-4**: 30 minutes (copy files)
- **Phase 5-7**: 30 minutes (testing & Docker)
- **Phase 8-10**: 20 minutes (configuration & verification)

**Total**: ~1.5-2 hours for complete integration
