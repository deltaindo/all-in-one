// Prisma seed script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@deltaindo.co.id' },
    update: {},
    create: {
      email: 'admin@deltaindo.co.id',
      password: 'hashed_password_here', // Use proper hashing in production
      name: 'Admin Delta',
      role: 'ADMIN',
      status: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample monitoring location
  const monitoring = await prisma.dNPMonitoring.createMany({
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

  console.log('✅ Monitoring locations created:', monitoring.count);

  // Create sample inventory items
  const inventory = await prisma.inventoryItem.createMany({
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

  console.log('✅ Inventory items created:', inventory.count);

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
