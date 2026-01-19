// Prisma seed script - Seeds master data for all Delta applications
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('📦 Seeding Users...');
  
  // Hash password for admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@deltaindo.co.id' },
    update: {},
    create: {
      email: 'admin@deltaindo.co.id',
      password: hashedPassword,
      name: 'Admin Delta',
      role: 'ADMIN',
      status: true,
    },
  });
  
  const staffPassword = await bcrypt.hash('staff123', 10);
  await prisma.user.upsert({
    where: { email: 'staff@deltaindo.co.id' },
    update: {},
    create: {
      email: 'staff@deltaindo.co.id',
      password: staffPassword,
      name: 'Staff Delta',
      role: 'STAFF',
      status: true,
    },
  });
  
  console.log('✅ Users seeded');
}

async function seedPICNewMasterData() {
  console.log('📦 Seeding PICNew Master Data...');
  
  // Seed Bidangs (Training Fields)
  const bidangs = [
    { name: 'Kesehatan dan Keselamatan Kerja', code: 'K3-001' },
    { name: 'Lingkungan Hidup', code: 'LH-001' },
    { name: 'Ketenagakerjaan', code: 'KTA-001' },
    { name: 'Keselamatan Kerja Khusus', code: 'KKK-001' },
    { name: 'Manajemen Risiko', code: 'MR-001' },
    { name: 'Ergonomi', code: 'ERG-001' },
    { name: 'Higiene Industri', code: 'HI-001' },
    { name: 'Kesehatan Kerja', code: 'KK-001' },
    { name: 'Sistem Manajemen K3', code: 'SM-001' },
    { name: 'Audit dan Inspeksi K3', code: 'AI-001' },
    { name: 'APD dan Alat Pelindung', code: 'APD-001' },
    { name: 'First Aid dan Emergency Response', code: 'FAER-001' },
    { name: 'Fire Safety', code: 'FS-001' },
  ];
  
  for (const bidang of bidangs) {
    await prisma.bidang.upsert({
      where: { code: bidang.code },
      update: {},
      create: bidang,
    });
  }
  console.log(`✅ ${bidangs.length} Bidangs seeded`);
  
  // Seed Training Programs
  const bidangMap = {};
  const allBidangs = await prisma.bidang.findMany();
  allBidangs.forEach(b => bidangMap[b.name] = b.id);
  
  const programs = [
    { name: 'BNSP K3 Umum', code: 'BNSP-K3U-001', bidangId: bidangMap['Kesehatan dan Keselamatan Kerja'], duration: 32 },
    { name: 'BNSP Ahli K3 Konstruksi', code: 'BNSP-K3K-001', bidangId: bidangMap['Keselamatan Kerja Khusus'], duration: 40 },
    { name: 'BNSP Ahli K3 Operasional', code: 'BNSP-K3O-001', bidangId: bidangMap['Kesehatan dan Keselamatan Kerja'], duration: 40 },
    { name: 'First Aid Provider', code: 'FAP-001', bidangId: bidangMap['First Aid dan Emergency Response'], duration: 16 },
    { name: 'Fire Safety Officer', code: 'FSO-001', bidangId: bidangMap['Fire Safety'], duration: 24 },
    { name: 'Higiene Industri Dasar', code: 'HID-001', bidangId: bidangMap['Higiene Industri'], duration: 24 },
    { name: 'Manajemen Risiko Dasar', code: 'MRD-001', bidangId: bidangMap['Manajemen Risiko'], duration: 16 },
    { name: 'Ergonomi Industri', code: 'ERI-001', bidangId: bidangMap['Ergonomi'], duration: 20 },
    { name: 'ISO 45001:2018 Implementation', code: 'ISO45K-001', bidangId: bidangMap['Sistem Manajemen K3'], duration: 24 },
    { name: 'Audit Sistem Manajemen K3', code: 'ASMK3-001', bidangId: bidangMap['Audit dan Inspeksi K3'], duration: 32 },
    { name: 'APD dan Pemakaian yang Benar', code: 'APD-001', bidangId: bidangMap['APD dan Alat Pelindung'], duration: 8 },
    { name: 'Inspeksi Keselamatan Kerja', code: 'IKK-001', bidangId: bidangMap['Audit dan Inspeksi K3'], duration: 16 },
    { name: 'Investigasi Kecelakaan Kerja', code: 'IK-001', bidangId: bidangMap['Kesehatan dan Keselamatan Kerja'], duration: 16 },
    { name: 'Komunikasi Keselamatan', code: 'KOM-001', bidangId: bidangMap['Kesehatan dan Keselamatan Kerja'], duration: 8 },
    { name: 'Emergency Response Planning', code: 'ERP-001', bidangId: bidangMap['First Aid dan Emergency Response'], duration: 16 },
    { name: 'Hazard Analysis dan Risk Assessment', code: 'HARA-001', bidangId: bidangMap['Manajemen Risiko'], duration: 24 },
    { name: 'Kesehatan Lingkungan Kerja', code: 'KLK-001', bidangId: bidangMap['Lingkungan Hidup'], duration: 16 },
    { name: 'Pengelolaan Limbah Industri', code: 'PLI-001', bidangId: bidangMap['Lingkungan Hidup'], duration: 24 },
  ];
  
  for (const program of programs) {
    await prisma.trainingProgram.upsert({
      where: { code: program.code },
      update: {},
      create: program,
    });
  }
  console.log(`✅ ${programs.length} Training Programs seeded`);
  
  // Seed Training Classes
  const allPrograms = await prisma.trainingProgram.findMany();
  let classCount = 0;
  
  for (const program of allPrograms) {
    const classes = ['Kelas A', 'Kelas B', 'Kelas C'];
    for (let i = 0; i < classes.length; i++) {
      await prisma.trainingClass.upsert({
        where: { code: `${program.code}-${String.fromCharCode(65 + i)}` },
        update: {},
        create: {
          name: classes[i],
          code: `${program.code}-${String.fromCharCode(65 + i)}`,
          trainingProgramId: program.id,
          personnelTypeIds: [],
          maxParticipants: 25 + (i * 5),
        },
      });
      classCount++;
    }
  }
  console.log(`✅ ${classCount} Training Classes seeded`);
  
  // Seed Personnel Types
  const personnelTypes = [
    { name: 'Director/Manager', code: 'DIR' },
    { name: 'Supervisor', code: 'SUP' },
    { name: 'Safety Officer', code: 'SO' },
    { name: 'HSE Staff', code: 'HSE' },
    { name: 'Worker', code: 'WRK' },
    { name: 'Contractor', code: 'CTR' },
    { name: 'Operator', code: 'OPR' },
    { name: 'Maintenance Staff', code: 'MAINT' },
  ];
  
  for (const type of personnelTypes) {
    await prisma.personnelType.upsert({
      where: { code: type.code },
      update: {},
      create: type,
    });
  }
  console.log(`✅ ${personnelTypes.length} Personnel Types seeded`);
  
  // Seed Document Types
  const documentTypes = [
    { name: 'Kartu Tanda Penduduk (KTP)', code: 'KTP', isMandatory: true },
    { name: 'Surat Izin Mengemudi (SIM)', code: 'SIM', isMandatory: false },
    { name: 'Paspor', code: 'PSP', isMandatory: false },
    { name: 'Ijazah Pendidikan Terakhir', code: 'IJZ', isMandatory: true },
    { name: 'Surat Keterangan Kerja', code: 'SKK', isMandatory: true },
    { name: 'Sertifikat Vaksinasi', code: 'VAK', isMandatory: false },
    { name: 'Foto Identitas 4x6', code: 'FOTO', isMandatory: true },
    { name: 'Surat Kesehatan', code: 'SK', isMandatory: false },
  ];
  
  for (const docType of documentTypes) {
    await prisma.documentType.upsert({
      where: { code: docType.code },
      update: {},
      create: docType,
    });
  }
  console.log(`✅ ${documentTypes.length} Document Types seeded`);
  
  // Seed Regions (Indonesian Provinces)
  const provinces = [
    { name: 'Aceh', code: 'AC' },
    { name: 'Bali', code: 'BA' },
    { name: 'Bangka Belitung', code: 'BB' },
    { name: 'Banten', code: 'BT' },
    { name: 'Bengkulu', code: 'BG' },
    { name: 'DI Yogyakarta', code: 'DIY' },
    { name: 'DKI Jakarta', code: 'JKT' },
    { name: 'Gorontalo', code: 'GO' },
    { name: 'Jambi', code: 'JB' },
    { name: 'Jawa Barat', code: 'JWB' },
    { name: 'Jawa Tengah', code: 'JWT' },
    { name: 'Jawa Timur', code: 'JWT' },
    { name: 'Kalimantan Barat', code: 'KLB' },
    { name: 'Kalimantan Selatan', code: 'KLS' },
    { name: 'Kalimantan Tengah', code: 'KLT' },
    { name: 'Kalimantan Timur', code: 'KLM' },
    { name: 'Kalimantan Utara', code: 'KLU' },
    { name: 'Kepulauan Riau', code: 'KRI' },
    { name: 'Lampung', code: 'LP' },
    { name: 'Maluku', code: 'ML' },
    { name: 'Maluku Utara', code: 'MLU' },
    { name: 'Nusa Tenggara Barat', code: 'NTB' },
    { name: 'Nusa Tenggara Timur', code: 'NTT' },
    { name: 'Papua', code: 'PA' },
    { name: 'Papua Barat', code: 'PB' },
    { name: 'Riau', code: 'RI' },
    { name: 'Sulawesi Barat', code: 'SLB' },
    { name: 'Sulawesi Selatan', code: 'SLS' },
    { name: 'Sulawesi Tengah', code: 'SLT' },
    { name: 'Sulawesi Tenggara', code: 'SLTE' },
    { name: 'Sulawesi Utara', code: 'SLU' },
    { name: 'Sumatera Barat', code: 'SUB' },
    { name: 'Sumatera Selatan', code: 'SUS' },
    { name: 'Sumatera Utara', code: 'SUU' },
    { name: 'West Java', code: 'WJ' },
  ];
  
  for (const province of provinces) {
    await prisma.region.upsert({
      where: { code: province.code },
      update: {},
      create: province,
    });
  }
  console.log(`✅ ${provinces.length} Regions (Provinces) seeded`);
  
  // Seed PICs
  const pics = [
    { name: 'Budi Santoso', email: 'budi@deltaindo.co.id', phoneNumber: '+62812345678', department: 'K3' },
    { name: 'Siti Nurhaliza', email: 'siti@deltaindo.co.id', phoneNumber: '+62812345679', department: 'Training' },
    { name: 'Ahmad Hidayat', email: 'ahmad@deltaindo.co.id', phoneNumber: '+62812345680', department: 'Audit' },
  ];
  
  for (const pic of pics) {
    await prisma.pIC.upsert({
      where: { email: pic.email },
      update: {},
      create: pic,
    });
  }
  console.log(`✅ ${pics.length} PICs seeded`);
  
  // Seed Marketing
  const marketing = [
    { name: 'Dewi Lestari', email: 'dewi.mkt@deltaindo.co.id', phoneNumber: '+62812345681', region: 'Jawa' },
    { name: 'Rudi Hermawan', email: 'rudi.mkt@deltaindo.co.id', phoneNumber: '+62812345682', region: 'Sumatera' },
  ];
  
  for (const mkt of marketing) {
    await prisma.marketing.upsert({
      where: { email: mkt.email },
      update: {},
      create: mkt,
    });
  }
  console.log(`✅ ${marketing.length} Marketing staff seeded`);
  
  console.log('✅ PICNew Master Data seeded');
}

async function seedLegacyData() {
  console.log('📦 Seeding Legacy Data (Monitoring, Inventory, etc.)...');
  
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@deltaindo.co.id' },
  });
  
  // Seed Monitoring Locations
  await prisma.dNPMonitoring.createMany({
    data: [
      {
        name: 'Main Office',
        location: 'Jakarta',
        status: 'ACTIVE',
        type: 'Office',
      },
      {
        name: 'Warehouse',
        location: 'Bekasi',
        status: 'ACTIVE',
        type: 'Warehouse',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Monitoring locations seeded');
  
  // Seed Inventory Items
  if (adminUser) {
    await prisma.inventoryItem.createMany({
      data: [
        {
          userId: adminUser.id,
          sku: 'SKU-001',
          name: 'Product A',
          category: 'Electronics',
          quantity: 100,
          price: 50000,
          minimumStock: 10,
        },
        {
          userId: adminUser.id,
          sku: 'SKU-002',
          name: 'Product B',
          category: 'Electronics',
          quantity: 50,
          price: 75000,
          minimumStock: 20,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Inventory items seeded');
  }
}

async function main() {
  console.log('\n🌱 Starting database seeding...\n');
  
  try {
    await seedUsers();
    await seedPICNewMasterData();
    await seedLegacyData();
    
    console.log('\n✅ Database seeding completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
