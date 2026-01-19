import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authenticateToken);

// List all registration links
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {
      createdBy: req.userId,
    };

    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { trainingProgram: { name: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    const links = await req.prisma.registrationLink.findMany({
      where,
      include: {
        trainingProgram: {
          include: {
            bidang: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const total = await req.prisma.registrationLink.count({ where });

    res.json({
      data: links,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create registration link
router.post('/', async (req: Request, res: Response) => {
  try {
    const { trainingProgramId, maxRegistrations, expiredAt } = req.body;

    if (!trainingProgramId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'trainingProgramId is required',
      });
    }

    const code = uuidv4().substring(0, 12).toUpperCase();

    const link = await req.prisma.registrationLink.create({
      data: {
        code,
        trainingProgramId,
        maxRegistrations: maxRegistrations || 100,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
        createdBy: req.userId!,
      },
      include: {
        trainingProgram: {
          include: {
            bidang: true,
          },
        },
      },
    });

    // Create audit log
    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'CREATE_LINK',
        description: `Created registration link ${code}`,
        targetId: link.id,
      },
    });

    res.status(201).json({ data: link });
  } catch (error: any) {
    console.error('Create link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get link by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const link = await req.prisma.registrationLink.findUnique({
      where: { id: req.params.id },
      include: {
        trainingProgram: {
          include: {
            bidang: true,
          },
        },
        registrations: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Registration link not found',
      });
    }

    res.json({ data: link });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update registration link
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { maxRegistrations, expiredAt, status } = req.body;

    const link = await req.prisma.registrationLink.update({
      where: { id: req.params.id },
      data: {
        ...(maxRegistrations && { maxRegistrations }),
        ...(expiredAt && { expiredAt: new Date(expiredAt) }),
        ...(status && { status }),
      },
      include: {
        trainingProgram: {
          include: {
            bidang: true,
          },
        },
      },
    });

    // Create audit log
    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'UPDATE_LINK',
        description: `Updated registration link ${link.code}`,
        targetId: link.id,
      },
    });

    res.json({ data: link });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete registration link
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const link = await req.prisma.registrationLink.findUnique({
      where: { id: req.params.id },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Registration link not found',
      });
    }

    await req.prisma.registrationLink.delete({
      where: { id: req.params.id },
    });

    // Create audit log
    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'DELETE_LINK',
        description: `Deleted registration link ${link.code}`,
        targetId: link.id,
      },
    });

    res.json({ data: { message: 'Link deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
