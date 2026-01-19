import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

// Get all master data
router.get('/', async (req: Request, res: Response) => {
  try {
    const [bidangs, trainingPrograms, trainingClasses, personnelTypes, documentTypes, regions, pics] =
      await Promise.all([
        req.prisma.bidang.findMany(),
        req.prisma.trainingProgram.findMany({ include: { bidang: true } }),
        req.prisma.trainingClass.findMany({ include: { trainingProgram: true } }),
        req.prisma.personnelType.findMany(),
        req.prisma.documentType.findMany(),
        req.prisma.region.findMany(),
        req.prisma.pIC.findMany(),
      ]);

    res.json({
      data: {
        bidangs,
        trainingPrograms,
        trainingClasses,
        personnelTypes,
        documentTypes,
        regions,
        pics,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get bidangs
router.get('/bidangs', async (req: Request, res: Response) => {
  try {
    const bidangs = await req.prisma.bidang.findMany();
    res.json({ data: bidangs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get training programs by bidang
router.get('/bidangs/:bidangId/programs', async (req: Request, res: Response) => {
  try {
    const programs = await req.prisma.trainingProgram.findMany({
      where: { bidangId: req.params.bidangId },
      include: { classes: true },
    });
    res.json({ data: programs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get training classes
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const classes = await req.prisma.trainingClass.findMany({
      include: { trainingProgram: true },
    });
    res.json({ data: classes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get personnel types
router.get('/personnel-types', async (req: Request, res: Response) => {
  try {
    const types = await req.prisma.personnelType.findMany();
    res.json({ data: types });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get document types
router.get('/document-types', async (req: Request, res: Response) => {
  try {
    const types = await req.prisma.documentType.findMany();
    res.json({ data: types });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get regions (provinces)
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const regions = await req.prisma.region.findMany();
    res.json({ data: regions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get regencies by province
router.get('/regions/:provinceId/regencies', async (req: Request, res: Response) => {
  try {
    const regencies = await req.prisma.regency.findMany({
      where: { regionId: req.params.provinceId },
    });
    res.json({ data: regencies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get districts by regency
router.get('/regencies/:regencyId/districts', async (req: Request, res: Response) => {
  try {
    const districts = await req.prisma.district.findMany({
      where: { regencyId: req.params.regencyId },
    });
    res.json({ data: districts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get villages by district
router.get('/districts/:districtId/villages', async (req: Request, res: Response) => {
  try {
    const villages = await req.prisma.village.findMany({
      where: { districtId: req.params.districtId },
    });
    res.json({ data: villages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get PICs
router.get('/pics', async (req: Request, res: Response) => {
  try {
    const pics = await req.prisma.pIC.findMany();
    res.json({ data: pics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get marketing data
router.get('/marketing', async (req: Request, res: Response) => {
  try {
    const marketing = await req.prisma.marketing.findMany();
    res.json({ data: marketing });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
