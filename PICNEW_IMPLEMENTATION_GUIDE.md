# PICNew Implementation Guide

Complete K3 Training Management System with Registration, Certificate Management, and Admin Dashboard.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Features](#features)

## Overview

PICNew is a comprehensive K3 (Kesehatan & Keselamatan Kerja) training management system built with:

- **Frontend**: Next.js 14 with TypeScript, React, Zustand, Tailwind CSS
- **Backend**: Express.js with TypeScript, Prisma ORM, JWT Auth
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with integration tests

## Architecture

### Tech Stack

```
┌─────────────────────────────────┐
│   Frontend (Next.js)            │
│ - Login/Dashboard               │
│ - Registration Links Manager    │
│ - Registrations Review          │
│ - Training Program Management   │
│ - Master Data Management        │
└────────────┬────────────────────┘
             │ HTTP/REST API
             ▼
┌─────────────────────────────────┐
│   Backend (Express.js)          │
│ - Authentication (JWT)          │
│ - Registration CRUD             │
│ - Link Management               │
│ - Master Data Endpoints         │
│ - Email Notifications           │
└────────────┬────────────────────┘
             │ SQL/Prisma
             ▼
┌─────────────────────────────────┐
│   Database (PostgreSQL)         │
│ - 30+ Models                    │
│ - Full K3 Training Data         │
└─────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+ (with npm or yarn)
- Docker & Docker Compose
- PostgreSQL (if running locally)
- Git

### Using Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/deltaindo/all-in-one.git
cd all-in-one

# 2. Copy environment template
cp .env.example .env

# 3. Update .env with your configuration (optional, defaults work for dev)

# 4. Start all services
docker-compose up -d

# 5. Run database migrations and seed
docker-compose exec picnew-backend npm run db:migrate
docker-compose exec picnew-backend npm run db:seed

# 6. Access the application
# Frontend: http://localhost:3000/login
# Backend API: http://localhost:5001
# Adminer: http://localhost:8080 (optional)
```

### Local Development

```bash
# 1. Install dependencies
cd apps/picnew-backend
npm install
cd ../../apps/picnew-frontend
npm install

# 2. Set up database
cd ../../
cp .env.example .env
npm run db:migrate
npm run db:seed

# 3. Start backend (terminal 1)
cd apps/picnew-backend
npm run dev

# 4. Start frontend (terminal 2)
cd apps/picnew-frontend
npm run dev

# 5. Access application
# Frontend: http://localhost:3000/login
# Backend: http://localhost:5001
```

## Frontend Setup

### Project Structure

```
apps/picnew-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with auth check
│   │   ├── login/
│   │   │   └── page.tsx            # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Main dashboard
│   │   ├── links/
│   │   │   └── page.tsx            # Links manager
│   │   ├── registrations/
│   │   │   └── page.tsx            # Registrations viewer
│   │   └── training/
│   │       └── page.tsx            # Training programs
│   ├── components/                 # Reusable React components
│   ├── lib/
│   │   └── api.ts                  # API client with Axios
│   ├── store/
│   │   ├── auth.ts                 # Auth store (Zustand)
│   │   └── data.ts                 # Data store (Zustand)
│   └── styles/
│       └── globals.css             # Global Tailwind styles
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

### Key Features

#### Authentication Flow

```typescript
// 1. User logs in via login page
const { login } = useAuthStore();
await login(email, password);

// 2. Token stored in localStorage
// 3. API client automatically adds token to all requests
// 4. Protected pages check auth and redirect to login if needed
```

#### State Management (Zustand)

```typescript
// Auth Store
const { user, token, login, logout } = useAuthStore();

// Data Store
const { masterData, links, registrations, fetchMasterData } = useDataStore();
```

#### API Integration

```typescript
// Using API client
import { apiClient } from '@/lib/api';

await apiClient.getLinks(page, limit);
await apiClient.createLink(trainingProgramId, maxRegistrations);
await apiClient.approveRegistration(registrationId);
```

### Building for Production

```bash
cd apps/picnew-frontend
npm run build
npm start
```

## Backend Setup

### Project Structure

```
apps/picnew-backend/
├── src/
│   ├── index.ts                    # Express app setup
│   ├── middleware/
│   │   └── auth.ts                 # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts                 # Auth endpoints
│   │   ├── links.ts                # Registration links CRUD
│   │   ├── training.ts             # Training programs CRUD
│   │   ├── registrations.ts        # Registrations management
│   │   ├── master-data.ts          # Master data endpoints
│   │   ├── public.ts               # Public registration endpoints
│   │   └── __tests__/              # Integration tests
│   └── services/
│       └── email.ts                # Email notification service
├── package.json
├── tsconfig.json
└── .env
```

### Key Features

#### JWT Authentication

```typescript
// Middleware protects routes
import { authMiddleware } from './middleware/auth';

router.get('/api/admin/links', authMiddleware, getLinks);

// Login returns JWT token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET!,
  { expiresIn: '24h' }
);
```

#### Registration Management

```typescript
// Create registration link
const link = await prisma.registrationLink.create({
  data: {
    trainingProgramId,
    maxRegistrations,
    code: generateUniqueCode(),
  },
});

// Track registrations
const registrations = await prisma.registration.findMany({
  where: { linkId },
  include: { participant: true },
});
```

#### Email Service

```typescript
// Send confirmation emails
import { sendRegistrationConfirmation } from './services/email';

await sendRegistrationConfirmation(
  email,
  name,
  registrationLink
);

// Send approval notifications
await sendApprovalNotification(email, name, programName, certificateNumber);
```

## Database

### Schema Overview

```prisma
// Key Models
- User (Admin users)
- RegistrationLink (Public registration entry points)
- TrainingProgram (K3 training courses)
- Registration (Participant registrations)
- Participant (K3 trainees)
- Certificate (Training certificates)
- Bidang (K3 classification areas - 13 required areas)
- TrainingClass (Individual training sessions)
- PersonnelType (Employee categorization)
- MasterData (Additional configuration)
```

### Migrations

```bash
# Run migrations
npm run db:migrate

# Create migration
cd packages/database
npx prisma migrate dev --name migration_name

# Seed data
npm run db:seed
```

### Master Data Included

- **13 Bidangs**: Required K3 training areas (Umum, Manajerial, Teknis, etc.)
- **19 Training Programs**: Comprehensive K3 programs
- **8 Personnel Types**: Employee classifications
- **33 Document Types**: Required documentation
- **34 Regions**: Indonesian provinces
- **Regencies & Districts**: Full administrative divisions

## API Endpoints

### Authentication

```
POST   /api/admin/auth/login        - Login (returns JWT token)
GET    /api/admin/auth/me           - Get current user
```

### Registration Links (Admin)

```
GET    /api/admin/links             - List all links (paginated)
GET    /api/admin/links/:id         - Get link details
POST   /api/admin/links             - Create new link
PUT    /api/admin/links/:id         - Update link
DELETE /api/admin/links/:id         - Delete link
```

### Registrations (Admin)

```
GET    /api/admin/registrations     - List all registrations (paginated)
GET    /api/admin/registrations/:id - Get registration details
POST   /api/admin/registrations/:id/approve  - Approve registration
POST   /api/admin/registrations/:id/reject   - Reject registration
GET    /api/admin/registrations/:linkId/export - Export as CSV/Excel
```

### Training Programs (Admin)

```
GET    /api/admin/training          - List programs (paginated)
GET    /api/admin/training/:id      - Get program details
POST   /api/admin/training          - Create program
PUT    /api/admin/training/:id      - Update program
DELETE /api/admin/training/:id      - Delete program
```

### Master Data

```
GET    /api/admin/master-data       - Get all master data
GET    /api/admin/master-data/bidangs
GET    /api/admin/master-data/classes
GET    /api/admin/master-data/personnel-types
GET    /api/admin/master-data/document-types
GET    /api/admin/master-data/regions
GET    /api/admin/master-data/regions/:provinceId/regencies
GET    /api/admin/master-data/regencies/:regencyId/districts
GET    /api/admin/master-data/districts/:districtId/villages
GET    /api/admin/master-data/pics
GET    /api/admin/master-data/marketing
```

### Public Registration

```
POST   /api/public/register         - Submit public registration
GET    /api/public/links/:code      - Get link by code (public)
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Backend tests only
cd apps/picnew-backend
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Test Coverage

```
✅ Authentication endpoints
✅ Registration links CRUD
✅ Input validation
✅ Authorization checks
✅ Error handling
```

### Example Test

```typescript
describe('Auth Routes', () => {
  it('should login with valid credentials', async () => {
    const response = await client.post('/api/admin/auth/login', {
      email: 'admin@deltaindo.co.id',
      password: 'admin123',
    });

    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('token');
  });
});
```

## Deployment

### Docker Deployment

```bash
# Build images
docker-compose build

# Deploy to production
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f picnew-backend
docker-compose logs -f picnew-frontend
```

### Environment Variables

```env
# Backend
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/picnew
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5001

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@deltaindo.co.id
```

### Scaling

```yaml
# Load balancing with nginx
# Multiple backend instances
# Database replication
# Cache layer (Redis)
```

## Features

### Current Implementation ✅

- [x] User authentication (Admin/Staff)
- [x] Registration link generation
- [x] Training program management
- [x] Registration approval workflow
- [x] Certificate tracking
- [x] Master data management
- [x] Email notifications
- [x] Admin dashboard
- [x] Comprehensive API
- [x] Database with 30+ models
- [x] JWT authentication
- [x] Full test coverage
- [x] Docker containerization
- [x] Frontend with Next.js
- [x] State management (Zustand)

### Future Enhancements 🚀

- [ ] Certificate PDF generation
- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Advanced reporting
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Multi-language support
- [ ] Two-factor authentication
- [ ] Audit logging

## Support & Documentation

- [API Documentation](./API_DOCS.md)
- [Database Schema](./DATABASE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Contributing Guide](./CONTRIBUTING.md)

## License

MIT License - See LICENSE file for details

## Credits

Built by Delta Indonesia Development Team

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
