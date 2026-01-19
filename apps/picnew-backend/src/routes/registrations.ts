import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// List registrations with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { linkId, status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (linkId) where.registrationLinkId = linkId;
    if (status) where.status = status;

    const registrations = await req.prisma.registration.findMany({
      where,
      include: {
        trainingClass: true,
        documents: true,
        registrationLink: {
          include: { trainingProgram: true },
        },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const total = await req.prisma.registration.count({ where });

    res.json({
      data: registrations,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get registration by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const registration = await req.prisma.registration.findUnique({
      where: { id: req.params.id },
      include: {
        trainingClass: true,
        documents: { include: { documentType: true } },
        registrationLink: { include: { trainingProgram: true } },
      },
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json({ data: registration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve registration
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const registration = await req.prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
      include: {
        trainingClass: true,
        registrationLink: { include: { trainingProgram: true } },
      },
    });

    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'APPROVE_REGISTRATION',
        description: `Approved registration for ${registration.fullName}`,
        targetId: registration.id,
      },
    });

    res.json({ data: registration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject registration
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    const registration = await req.prisma.registration.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        trainingClass: true,
        registrationLink: { include: { trainingProgram: true } },
      },
    });

    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'REJECT_REGISTRATION',
        description: `Rejected registration for ${registration.fullName}`,
        targetId: registration.id,
      },
    });

    res.json({ data: registration });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export registrations (CSV)
router.get('/:linkId/export', async (req: Request, res: Response) => {
  try {
    const registrations = await req.prisma.registration.findMany({
      where: { registrationLinkId: req.params.linkId },
      include: { trainingClass: true, documents: true },
    });

    let csv = 'Nama Lengkap,Email,Nomor Telepon,Status,Bidang,Kelas\n';
    registrations.forEach((reg) => {
      csv += `${reg.fullName},${reg.email},${reg.phoneNumber},${reg.status},${reg.bidang},${reg.trainingClass?.name}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
