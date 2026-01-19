import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// List training programs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { bidangId, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (bidangId) where.bidangId = bidangId;

    const programs = await req.prisma.trainingProgram.findMany({
      where,
      include: { bidang: true, classes: true },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    const total = await req.prisma.trainingProgram.count({ where });

    res.json({
      data: programs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create training program
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, bidangId, duration, description } = req.body;

    const program = await req.prisma.trainingProgram.create({
      data: {
        name,
        code,
        bidangId,
        duration,
        description,
      },
      include: { bidang: true },
    });

    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'CREATE_TRAINING',
        description: `Created training program ${name}`,
        targetId: program.id,
      },
    });

    res.status(201).json({ data: program });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get training by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const program = await req.prisma.trainingProgram.findUnique({
      where: { id: req.params.id },
      include: {
        bidang: true,
        classes: true,
        registrationLinks: { select: { id: true, code: true, status: true } },
      },
    });

    if (!program) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    res.json({ data: program });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update training
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, code, duration, description } = req.body;

    const program = await req.prisma.trainingProgram.update({
      where: { id: req.params.id },
      data: { name, code, duration, description },
      include: { bidang: true },
    });

    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'UPDATE_TRAINING',
        description: `Updated training program ${name}`,
        targetId: program.id,
      },
    });

    res.json({ data: program });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete training
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const program = await req.prisma.trainingProgram.findUnique({
      where: { id: req.params.id },
      select: { name: true },
    });

    if (!program) {
      return res.status(404).json({ error: 'Training program not found' });
    }

    await req.prisma.trainingProgram.delete({
      where: { id: req.params.id },
    });

    await req.prisma.auditLog.create({
      data: {
        userId: req.userId!,
        action: 'DELETE_TRAINING',
        description: `Deleted training program ${program.name}`,
        targetId: req.params.id,
      },
    });

    res.json({ data: { message: 'Training program deleted' } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
