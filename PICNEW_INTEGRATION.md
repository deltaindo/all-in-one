# PICNew Integration Guide

## Overview

PICNew is a K3 (Kesehatan dan Keselamatan Kerja / Occupational Health & Safety) Training Registration and Management System integrated into the Delta Unified monorepo.

### What is PICNew?

PICNew is a comprehensive training management platform that handles:
- **Training Program Management** - Create and manage K3 training programs organized by Bidang (training fields)
- **Registration Links** - Generate unique registration links for trainee enrollment
- **Registration Management** - Process and approve trainee applications
- **Document Verification** - Manage required documents from trainees
- **Certificate Generation** - Issue certificates upon completion
- **Audit Logging** - Complete audit trail of all operations

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js 14)                        │
│         http://localhost:3001 (Development)                  │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard | Training CRUD | Links Manager |            │
│  Registrations | Master Data | User Management              │
└────────────────────────┬────────────────────────────────────┘
                         │ Axios HTTP
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express.js)                             │
│          http://localhost:5001 (Development)                 │
├─────────────────────────────────────────────────────────────┤
│  6 Route Groups:                                              │
│  • /api/admin/auth          - Authentication               │
│  • /api/admin/links         - Link CRUD                    │
│  • /api/admin/training      - Training CRUD               │
│  • /api/admin/registrations - Registration Review          │
│  • /api/admin/master-data   - Data Fetch                   │
│  • /api/public              - Public Registration           │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
                         ↓
┌─────────────────────────────────────────────────────────────┐
│           Database (PostgreSQL 16)                            │
│          postgresql://deltauser@localhost:5432               │
├─────────────────────────────────────────────────────────────┤
│  30+ Models:                                                  │
│  • Core: User, AuditLog                                     │
│  • Master: Bidang, TrainingProgram, TrainingClass           │
│  • Enrollmnt: RegistrationLink, Registration, Certificate    │
│  • Geography: Region, Regency, District, Village            │
│  • Supporting: PersonnelType, DocumentType, PIC, Marketing  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone & Setup

```bash
# Clone repo
git clone <repo-url>
cd all-in-one

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 2. Database Setup

```bash
# Create database migrations
npm run db:migrate

# Seed master data (13 bidangs + 19 programs + more)
npm run db:seed

# Optional: View database in Prisma Studio
npm run db:studio
```

### 3. Start Services

**Option A: Development Mode (Recommended)**
```bash
# Terminal 1: Backend
cd apps/picnew-backend
npm run dev
# Backend runs on http://localhost:5001

# Terminal 2: Frontend
cd apps/picnew-frontend
npm run dev
# Frontend runs on http://localhost:3001

# Terminal 3: Database (PostgreSQL)
# Use docker if available
docker run -d \
  -e POSTGRES_USER=deltauser \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=delta_unified \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B: Docker Compose**
```bash
# Start all services
docker-compose --profile picnew --profile all up

# Or just PICNew
docker-compose --profile picnew up

# Or just database
docker-compose up postgres
```

### 4. Access the Application

**Admin Portal**: http://localhost:3001
- Login: `admin@deltaindo.co.id` / `admin123`
- Or: `staff@deltaindo.co.id` / `staff123`

**API Documentation**: http://localhost:5001/health

**Database Studio**: `npm run db:studio`

## Database Schema

### Core Models

#### User
```typescript
model User {
  id: string           // Primary key
  email: string        // Unique email
  password: string     // Hashed password (bcrypt)
  name: string         // User full name
  role: UserRole       // ADMIN, MANAGER, STAFF, USER, VIEWER
  status: boolean      // Active/Inactive
  
  // Relations
  registrationLinks: RegistrationLink[]  // Links created
  auditLogs: AuditLog[]                  // Actions logged
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Training Models

#### Bidang (Training Fields)
13 predefined bidangs for K3 training:
- Kesehatan dan Keselamatan Kerja
- Lingkungan Hidup
- Ketenagakerjaan
- Manajemen Risiko
- Ergonomi
- Higiene Industri
- Fire Safety
- First Aid
- etc.

```typescript
model Bidang {
  id: string
  name: string  // Unique
  code: string  // Unique
  description: string
  
  trainingPrograms: TrainingProgram[]
  createdAt: DateTime
}
```

#### TrainingProgram
19 programs across bidangs:
- BNSP K3 Umum
- BNSP Ahli K3 Konstruksi
- First Aid Provider
- Fire Safety Officer
- ISO 45001:2018
- etc.

```typescript
model TrainingProgram {
  id: string
  name: string       // Program name
  code: string       // Unique code
  bidangId: string   // Reference to Bidang
  duration: number   // Hours
  description: string
  
  bidang: Bidang
  classes: TrainingClass[]
  requiredDocuments: RequiredDocument[]
  registrationLinks: RegistrationLink[]
  createdAt: DateTime
}
```

#### TrainingClass
3 classes per program (A, B, C):
```typescript
model TrainingClass {
  id: string
  name: string                    // "Kelas A", "Kelas B", "Kelas C"
  code: string                    // PROGRAM_CODE-A, etc
  trainingProgramId: string
  personnelTypeIds: string[]      // JSON array
  maxParticipants: number         // Default 25-35
  
  trainingProgram: TrainingProgram
  registrations: Registration[]
  createdAt: DateTime
}
```

### Registration Models

#### RegistrationLink
Auto-generated unique links for registration:
```typescript
model RegistrationLink {
  id: string
  code: string              // Unique UUID (e.g., "A1B2C3D4E5F6")
  trainingProgramId: string
  createdBy: string         // User ID
  maxRegistrations: number  // Null = unlimited
  status: LinkStatus        // ACTIVE, INACTIVE, EXPIRED
  expiredAt: DateTime       // Optional expiry
  
  trainingProgram: TrainingProgram
  createdByUser: User
  registrations: Registration[]
  createdAt: DateTime
}
```

#### Registration
Trainee registration (starts PENDING, no sample rows seeded):
```typescript
model Registration {
  id: string
  registrationLinkId: string
  fullName: string
  email: string
  phoneNumber: string
  bidang: string            // Bidang name
  trainingClassId: string   // Selected class
  personnelTypeId: string   // Selected role
  
  // Address
  provinceId: string
  regencyId: string
  districtId: string
  villageId: string
  address: string
  
  status: RegistrationStatus      // PENDING → APPROVED → COMPLETED
  submissionToken: string         // For status checking
  rejectionReason: string         // If rejected
  
  registrationLink: RegistrationLink
  trainingClass: TrainingClass
  documents: TraineeDocument[]
  createdAt: DateTime
  approvedAt: DateTime
}
```

#### TraineeDocument
Document uploads from trainees:
```typescript
model TraineeDocument {
  id: string
  registrationId: string
  documentTypeId: string
  fileName: string
  fileUrl: string             // URL to cloud storage
  status: DocumentStatus      // PENDING, VERIFIED, REJECTED
  verificationNotes: string
  
  registration: Registration
  documentType: DocumentType
  uploadedAt: DateTime
  verifiedAt: DateTime
}
```

#### Certificate
```typescript
model Certificate {
  id: string
  registrationId: string      // Unique
  certificateNumber: string   // Unique
  issuedDate: DateTime
  validUntil: DateTime        // Optional expiry
  fileUrl: string             // PDF URL
  verificationCode: string    // Unique, for public verification
  
  createdAt: DateTime
}
```

### Master Data Models

#### DocumentType
8 mandatory/optional document types:
- KTP (Mandatory)
- Ijazah (Mandatory)
- Surat Keterangan Kerja (Mandatory)
- Foto 4x6 (Mandatory)
- SIM, Paspor, Sertifikat Vaksinasi, Surat Kesehatan (Optional)

#### PersonnelType
8 personnel types:
- Director/Manager
- Supervisor
- Safety Officer
- HSE Staff
- Worker
- Contractor
- Operator
- Maintenance Staff

#### Geographic Models
- **Region** - 35 Indonesian provinces
- **Regency** - Cities/regencies per province
- **District** - Sub-districts per regency
- **Village** - Villages per district

#### Supporting Models
- **PIC** - Person In Charge (3 sample)
- **Marketing** - Marketing staff (2 sample)
- **Notification** - Email/WhatsApp/SMS

### Audit & Security

#### AuditLog
```typescript
model AuditLog {
  id: string
  userId: string        // User who performed action
  action: string        // CREATE_LINK, APPROVE_REGISTRATION, etc
  description: string   // Human-readable description
  targetId: string      // ID of affected entity
  oldValue: Json        // Previous value (if update)
  newValue: Json        // New value (if update)
  ipAddress: string
  userAgent: string
  
  user: User
  createdAt: DateTime
}
```

## API Endpoints

### Authentication

```
POST   /api/admin/auth/login         - Login
GET    /api/admin/auth/me            - Get current user
POST   /api/admin/auth/register      - Create new user (admin only)
```

### Registration Links

```
GET    /api/admin/links              - List links (paginated)
POST   /api/admin/links              - Create new link
GET    /api/admin/links/:id          - Get link details
PUT    /api/admin/links/:id          - Update link
DELETE /api/admin/links/:id          - Delete link
```

### Training Programs

```
GET    /api/admin/training           - List programs
POST   /api/admin/training           - Create program
GET    /api/admin/training/:id       - Get program
PUT    /api/admin/training/:id       - Update program
DELETE /api/admin/training/:id       - Delete program
```

### Registrations

```
GET    /api/admin/registrations      - List registrations
GET    /api/admin/registrations/:id  - Get registration details
POST   /api/admin/registrations/:id/approve  - Approve registration
POST   /api/admin/registrations/:id/reject   - Reject registration
GET    /api/admin/registrations/:linkId/export - Export as CSV
```

### Master Data

```
GET    /api/admin/master-data        - Get all master data
GET    /api/admin/master-data/bidangs
GET    /api/admin/master-data/classes
GET    /api/admin/master-data/personnel-types
GET    /api/admin/master-data/document-types
GET    /api/admin/master-data/regions
GET    /api/admin/master-data/regions/:provinceId/regencies
GET    /api/admin/master-data/pics
GET    /api/admin/master-data/marketing
```

### Public Registration

```
GET    /api/public/links/:code/validate              - Validate link
POST   /api/public/registrations/submit              - Submit registration
GET    /api/public/registrations/:token/status       - Check status
```

## Seeding Information

The seed script creates:

**Users** (2):
- admin@deltaindo.co.id / admin123 (ADMIN role)
- staff@deltaindo.co.id / staff123 (STAFF role)

**Bidangs** (13):
- Kesehatan dan Keselamatan Kerja
- Lingkungan Hidup
- Ergonomi
- Higiene Industri
- Fire Safety
- First Aid
- Manajemen Risiko
- Sistem Manajemen K3
- etc.

**Training Programs** (19):
- BNSP K3 Umum (32 hours)
- BNSP Ahli K3 Konstruksi (40 hours)
- First Aid Provider (16 hours)
- Fire Safety Officer (24 hours)
- ISO 45001:2018 (24 hours)
- etc.

**Training Classes** (57):
- 3 classes per program (A, B, C)
- Max participants: 25-35 per class

**Personnel Types** (8):
- Director/Manager, Supervisor, Safety Officer, etc.

**Document Types** (8):
- KTP, Ijazah, Surat Keterangan Kerja, etc.

**Regions** (35):
- All Indonesian provinces

**PICs** (3) & **Marketing** (2):
- Sample personnel data

**RegistrationLinks & Registrations**:
- ⚠️ NONE - Empty tables (links auto-generated when needed)

## Development Workflow

### Adding a New Training Program

1. **Via Database:**
```bash
DEMO: npm run db:studio  # GUI interface
SQL: INSERT INTO training_programs (...) VALUES (...);
```

2. **Via API:**
```bash
curl -X POST http://localhost:5001/api/admin/training \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New K3 Program",
    "code": "NEW-K3-001",
    "bidangId": "<bidang-id>",
    "duration": 32
  }'
```

### Creating a Registration Link

```bash
curl -X POST http://localhost:5001/api/admin/links \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "trainingProgramId": "<program-id>",
    "maxRegistrations": 50,
    "expiredAt": "2024-12-31T23:59:59Z"
  }'

# Response:
# {
#   "data": {
#     "id": "...",
#     "code": "A1B2C3D4E5F6",
#     "status": "ACTIVE",
#     "..."
#   }
# }
```

**Share link with trainees:**
```
http://localhost:3001/register/A1B2C3D4E5F6
```

### Approving Registrations

1. **Admin views pending registrations**
2. **Reviews submitted documents**
3. **Clicks Approve/Reject button**
4. **Certificate auto-generated on approval**

## Database Migrations

### Create Migration
```bash
cd packages/database
npx prisma migrate dev --name add_new_feature
# Creates migration and applies to database
```

### View Schema Changes
```bash
npm run db:studio  # Visual editor
# Or edit: packages/database/prisma/schema.prisma
```

### Production Deploy
```bash
npm run db:migrate-prod  # Applies migrations to production
```

## Environment Variables

### Critical Variables
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-key-here
NEXT_PUBLIC_API_URL=http://backend:5001
```

### Optional
```env
SMTP_*           # Email notifications
TWILIO_*         # WhatsApp blaster
CLOUDINARY_*     # File storage
```

## Troubleshooting

### Database Connection Error
```bash
# Ensure PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql postgresql://deltauser:password123@localhost:5432/delta_unified
```

### Migration Issues
```bash
# Reset database (DELETES ALL DATA)
cd packages/database
npx prisma migrate reset

# Then re-seed
npm run db:seed
```

### Port Already in Use
```bash
# Kill process on port 5001 (backend)
lsof -i :5001
kill -9 <PID>

# Or change port in .env
PORT=5002
```

## Testing

### Unit Tests
```bash
cd apps/picnew-backend
npm test

cd apps/picnew-frontend
npm test
```

### Integration Tests
```bash
# With database running
npm run test:integration
```

### API Testing
```bash
# Using curl or Postman
# See API Endpoints section above
```

## Deployment

### Docker Build
```bash
docker build -t picnew-backend:1.0.0 \
  --build-arg WORKDIR=apps/picnew-backend .

docker build -t picnew-frontend:1.0.0 \
  --build-arg WORKDIR=apps/picnew-frontend .
```

### Docker Compose Production
```bash
docker-compose --profile picnew --profile all up -d

# Check logs
docker-compose logs -f picnew-backend
docker-compose logs -f picnew-frontend
```

### Environment for Production
```env
NODE_ENV=production
JWT_SECRET=<secure-random-key>
DATABASE_URL=postgresql://prod_user:prod_pass@prod_db:5432/delta_unified
NEXT_PUBLIC_API_URL=https://api.deltaindo.co.id
```

## Next Steps

1. ✅ **Integrate Frontend** - Build admin dashboard
2. ✅ **Add File Uploads** - Cloudinary or S3
3. ✅ **Email Notifications** - Registration confirmations
4. ✅ **Export Features** - CSV/PDF reports
5. ✅ **SMS/WhatsApp** - Notification blaster
6. ✅ **Analytics** - Dashboard and KPIs
7. ✅ **Mobile App** - React Native companion

## Support

For issues or questions:
- 📧 Email: support@deltaindo.co.id
- 💬 Slack: #picnew-support
- 📚 Docs: https://docs.deltaindo.co.id/picnew

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
