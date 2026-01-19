# PIC App - Training Registration & Management System

## Overview

PIC App is a comprehensive training registration and management system designed for K3 (Keselamatan dan Kesehatan Kerja - Occupational Safety and Health) training programs.

### Features

- **Registration Link Management**: Create and manage training registration links
- **Master Data**: Manage PIC (Person In Charge), Marketing personnel, and Program Types
- **Trainee Registration**: Online registration with document upload support
- **Certificate Management**: Generate and issue training certificates
- **Admin Dashboard**: Comprehensive admin interface for managing training programs
- **Notification System**: Email and WhatsApp notifications
- **Audit Logging**: Track all system activities

## Project Structure

```
apps/pic/
├── backend/              # Express.js + Prisma backend
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── prisma/          # Database schema and migrations
│   ├── server.js        # Main server file
│   └── package.json
├── frontend/             # React-based admin interface
│   ├── src/
│   ├── public/
│   └── package.json
└── package.json          # Root PIC app package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 16+

### Installation

```bash
# From root directory
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### Development

```bash
# Run all apps in parallel
npm run dev

# Or run specific app
cd apps/pic
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

## Database Setup

### Auto-Seeding

The system includes auto-seeding on startup:

```bash
docker-compose up
# Auto-seeding runs automatically!
```

### Master Data

The following master data is automatically seeded:

**PIC (7 entries)**:
- Ghaida Trisnanda
- Yuyun
- Echasita
- Erje
- Nur Afidah
- Hafid
- Daniel Setiono

**Marketing (12 entries)**:
- Agustyani, Atikah, Anik, Yoppi, Intang, Hafid, Ali M, Erje, Indri, Bayu, Yunny, Eko

**Program Types (3 entries)**:
- Reguler
- Inhouse
- BNSP

## API Documentation

### Admin Endpoints

```
POST   /api/admin/auth/init-admin           - Initialize superadmin
POST   /api/admin/auth/login                - Admin login
GET    /api/admin/auth/status               - Check initialization status

GET    /api/admin/links                     - List registration links
POST   /api/admin/links                     - Create registration link
GET    /api/admin/links/:id                 - Get link details
PUT    /api/admin/links/:id                 - Update link
DELETE /api/admin/links/:id                 - Delete link

GET    /api/admin/training                  - List training programs
POST   /api/admin/training                  - Create training program
PUT    /api/admin/training/:id              - Update training program
DELETE /api/admin/training/:id              - Delete training program

GET    /api/admin/registrations             - List registrations
GET    /api/admin/registrations/:id         - Get registration details

GET    /api/admin/master-data/pic           - Get all PIC
POST   /api/admin/master-data/pic           - Create PIC
GET    /api/admin/master-data/marketing     - Get all Marketing
POST   /api/admin/master-data/marketing     - Create Marketing
GET    /api/admin/master-data/program_types - Get all Program Types
POST   /api/admin/master-data/program_types - Create Program Type
```

### Public Endpoints

```
GET    /api/public/links/:token              - Get form data (no auth)
POST   /api/public/registrations            - Submit registration (no auth)
```

## Environment Variables

Create `.env.local` in the `apps/pic/backend` directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pic_app
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pic_app
DB_USER=postgres
DB_PASSWORD=postgres

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d

# File Storage (S3)
AWS_REGION=ap-southeast-1
AWS_BUCKET=pic-app-bucket
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Run migrations in container
docker-compose exec pic-backend npm run prisma:migrate
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- api.test.js
```

## Performance

| Operation | Duration | Notes |
|-----------|----------|-------|
| Fresh database (first run) | +100ms | One-time seed |
| Container restart (data exists) | +10ms | Skip seed |
| API call to /api/admin/links | <50ms | With pagination |
| Master data API calls | <20ms | Usually cached |

## Security

- ✅ Foreign key constraints enabled
- ✅ Cascade delete for orphaned data
- ✅ User authentication required for admin endpoints
- ✅ Input validation on all API endpoints
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS protection
- ✅ Helmet.js security headers

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
psql -U postgres -h localhost -c "SELECT 1"

# Check database exists
psql -U postgres -l | grep pic_app
```

### Migration Issues

```bash
# Reset database (dev only!)
cd backend && npm run prisma:reset

# Check migration status
npm run prisma:status

# View database with Prisma Studio
npm run prisma:studio
```

### Auto-Seed Not Running

```bash
# Manually seed
cd backend && npm run prisma:seed

# Check logs for errors
docker-compose logs -f backend
```

## Contributing

When making changes to the database schema:

1. Edit `backend/prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Update seeders in `backend/prisma/seed.ts` if needed
4. Test thoroughly before committing

## License

MIT

## Support

For issues and questions, contact the Delta Indonesia development team.
