import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

// Import routes
import authRoutes from './routes/auth';
import linksRoutes from './routes/links';
import trainingRoutes from './routes/training';
import registrationsRoutes from './routes/registrations';
import masterDataRoutes from './routes/master-data';
import publicRoutes from './routes/public';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}


const app: Express = express();
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const PORT = process.env.PORT || 5001;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make prisma available in requests
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
      userId?: string;
      role?: string;
    }
  }
}

app.use((req: Request, res, next) => {
  req.prisma = prisma;
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'picnew-backend' });
});

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/links', linksRoutes);
app.use('/api/admin/training', trainingRoutes);
app.use('/api/admin/registrations', registrationsRoutes);
app.use('/api/admin/master-data', masterDataRoutes);
app.use('/api/public', publicRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`PICNew Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await prisma.$disconnect();
  process.exit(0);
});
