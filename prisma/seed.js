const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean up any existing data first to prevent constraint violations on repeat runs
  await prisma.emailLog.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.agent.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.rateChangeLog.deleteMany({});
  await prisma.goldRate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.blogPost.deleteMany({});

  // 1. Create Branches
  const b1 = await prisma.branch.create({
    data: {
      name: 'Downtown Branch',
      address: '123 Luxury Way, Suite 100, Metropolis',
      phone: '+1 (555) 019-2834',
      email: 'downtown@capitalgoldbuyers.com',
      hours: 'Mon-Fri: 9:00 AM - 6:00 PM, Sat: 10:00 AM - 4:00 PM, Sun: Closed',
      mapUrl: 'https://maps.google.com/?q=123+Luxury+Way+Metropolis',
      isActive: true,
    },
  });

  const b2 = await prisma.branch.create({
    data: {
      name: 'Westside Branch',
      address: '456 Commerce Blvd, Westside Mall, Metropolis',
      phone: '+1 (555) 019-5678',
      email: 'westside@capitalgoldbuyers.com',
      hours: 'Mon-Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 5:00 PM',
      mapUrl: 'https://maps.google.com/?q=456+Commerce+Blvd+Metropolis',
      isActive: true,
    },
  });

  console.log('Branches seeded.');

  // 2. Hash Passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const staffPasswordHash = await bcrypt.hash('staff123', 10);

  // 3. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@capitalgold.com',
      name: 'Admin User',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@capitalgold.com',
      name: 'Staff Member',
      password: staffPasswordHash,
      role: 'STAFF',
      branchId: b1.id,
    },
  });

  console.log('Users seeded.');

  // 4. Create Gold Rates
  await prisma.goldRate.create({
    data: {
      metal: 'GOLD',
      purity: '24K',
      ratePerGram: 7250.00,
      ratePerTola: 84560.00,
      isPublished: true,
      updatedBy: admin.name,
    },
  });

  await prisma.goldRate.create({
    data: {
      metal: 'GOLD',
      purity: '22K',
      ratePerGram: 6680.00,
      ratePerTola: 77915.00,
      isPublished: true,
      updatedBy: admin.name,
    },
  });

  await prisma.goldRate.create({
    data: {
      metal: 'GOLD',
      purity: '18K',
      ratePerGram: 5440.00,
      ratePerTola: 63450.00,
      isPublished: true,
      updatedBy: admin.name,
    },
  });

  await prisma.goldRate.create({
    data: {
      metal: 'SILVER',
      purity: '999',
      ratePerGram: 95.00,
      ratePerTola: 1108.00,
      isPublished: true,
      updatedBy: admin.name,
    },
  });

  console.log('Gold & Silver rates seeded.');

  // 5. Create Agents for calling queue
  await prisma.agent.create({
    data: {
      name: 'Sarah Connor',
      phone: '+1 (555) 019-1111',
      branchId: b1.id,
      isOnline: true,
      priority: 1,
    },
  });

  await prisma.agent.create({
    data: {
      name: 'John Miller',
      phone: '+1 (555) 019-2222',
      branchId: b2.id,
      isOnline: true,
      priority: 2,
    },
  });

  console.log('Agents seeded.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
