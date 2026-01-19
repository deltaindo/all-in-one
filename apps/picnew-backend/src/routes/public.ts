import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Validate registration link
router.get('/links/:code/validate', async (req: Request, res: Response) => {
  try {
    const link = await req.prisma.registrationLink.findUnique({
      where: { code: req.params.code },
      include: {
        trainingProgram: {
          include: {
            bidang: true,
            classes: true,
          },
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

    if (link.status === 'INACTIVE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This registration link is inactive',
      });
    }

    if (link.expiredAt && new Date(link.expiredAt) < new Date()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'This registration link has expired',
      });
    }

    if (link.maxRegistrations && link._count.registrations >= link.maxRegistrations) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Maximum registrations reached for this link',
      });
    }

    // Get required document types for this training program
    const requiredDocuments = await req.prisma.requiredDocument.findMany({
      where: { trainingProgramId: link.trainingProgramId },
      include: { documentType: true },
    });

    res.json({
      data: {
        link: {
          id: link.id,
          code: link.code,
          trainingProgram: link.trainingProgram,
          maxRegistrations: link.maxRegistrations,
          currentRegistrations: link._count.registrations,
        },
        requiredDocuments,
      },
    });
  } catch (error: any) {
    console.error('Validate link error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// Submit registration
router.post('/registrations/submit', async (req: Request, res: Response) => {
  try {
    const {
      code,
      fullName,
      email,
      phoneNumber,
      bidang,
      trainingClassId,
      personnelTypeId,
      provinceId,
      regencyId,
      districtId,
      villageId,
      address,
      documents,
    } = req.body;

    // Validate link
    const link = await req.prisma.registrationLink.findUnique({
      where: { code },
    });

    if (!link) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Invalid registration link',
      });
    }

    if (link.status === 'INACTIVE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Registration link is inactive',
      });
    }

    // Create registration
    const registration = await req.prisma.registration.create({
      data: {
        registrationLinkId: link.id,
        fullName,
        email,
        phoneNumber,
        bidang,
        trainingClassId,
        personnelTypeId,
        provinceId,
        regencyId,
        districtId,
        villageId,
        address,
        status: 'PENDING',
        submissionToken: uuidv4(),
      },
      include: {
        trainingClass: true,
        registrationLink: { include: { trainingProgram: true } },
      },
    });

    // Handle document uploads
    if (documents && Array.isArray(documents)) {
      for (const doc of documents) {
        await req.prisma.traineeDocument.create({
          data: {
            registrationId: registration.id,
            documentTypeId: doc.documentTypeId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl, // Should be uploaded to cloud storage first
            uploadedAt: new Date(),
          },
        });
      }
    }

    // Create audit log
    await req.prisma.auditLog.create({
      data: {
        userId: 'SYSTEM',
        action: 'NEW_REGISTRATION',
        description: `New registration submitted by ${fullName}`,
        targetId: registration.id,
      },
    });

    res.status(201).json({
      data: {
        id: registration.id,
        submissionToken: registration.submissionToken,
        message: 'Registration submitted successfully. Please check your email for next steps.',
      },
    });
  } catch (error: any) {
    console.error('Submit registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

// Check registration status
router.get('/registrations/:token/status', async (req: Request, res: Response) => {
  try {
    const registration = await req.prisma.registration.findUnique({
      where: { submissionToken: req.params.token },
      include: {
        trainingClass: true,
        registrationLink: { include: { trainingProgram: true } },
        documents: { include: { documentType: true } },
      },
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Registration not found',
      });
    }

    res.json({ data: registration });
  } catch (error: any) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});

export default router;
