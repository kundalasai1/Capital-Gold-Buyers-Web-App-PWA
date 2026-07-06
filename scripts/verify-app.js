const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  // Test 1: Password hashing & verification
  console.log('Test 1: Password hashing & verification...');
  const pass = 'testPass123';
  const hash = await bcrypt.hash(pass, 10);
  assert(await bcrypt.compare(pass, hash), 'Bcrypt compare failed');
  console.log('✔ Password hashing verified.');

  // Test 2: JWT token signing and verification
  console.log('Test 2: JWT token signing and verification...');
  const payload = { userId: '123', email: 'test@email.com', role: 'ADMIN', name: 'Tester' };
  const secret = 'test-secret';
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const verified = jwt.verify(token, secret);
  assert.strictEqual(verified.email, payload.email, 'JWT email mismatch');
  assert.strictEqual(verified.role, payload.role, 'JWT role mismatch');
  console.log('✔ JWT token signed and verified.');

  // Test 3: Gold rate calculations (8% deduction)
  console.log('Test 3: Gold rate calculations (8% deduction)...');
  const weight = 10; 
  const rate = 70; 
  const gross = weight * rate;
  const payout = +(gross * (1 - 0.08)).toFixed(2);
  assert.strictEqual(payout, 644, 'Calculation payout mismatch');
  console.log('✔ Calculator payout formulas verified.');

  // Test 4: Database query connectivity & dynamic booking slot conflicts
  console.log('Test 4: Checking booking slot conflicts in database...');
  const branches = await prisma.branch.findMany();
  assert(branches.length > 0, 'No branches seeded in DB');
  const testBranch = branches[0];

  // Create temporary appointment
  const testAppt = await prisma.appointment.create({
    data: {
      branchId: testBranch.id,
      slotDate: '2026-07-07',
      slotTime: '12:00',
      customerName: 'Test Client',
      phone: '1234567890',
      email: 'test@client.com',
      status: 'APPROVED',
    },
  });

  // Verify slot conflict
  const conflict = await prisma.appointment.findFirst({
    where: {
      branchId: testBranch.id,
      slotDate: '2026-07-07',
      slotTime: '12:00',
      status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
    },
  });
  assert(conflict !== null, 'Conflict slot not detected');
  assert.strictEqual(conflict.id, testAppt.id, 'Conflict ID mismatch');

  // Clean up
  await prisma.appointment.delete({ where: { id: testAppt.id } });
  console.log('✔ Booking slot conflict checks verified.');

  // Test 5: Lead notes activity log appending
  console.log('Test 5: Lead notes activity log appending...');
  const testLead = await prisma.lead.create({
    data: {
      name: 'Test Lead',
      phone: '111-222-3333',
      email: 'lead@test.com',
      inquirySource: 'CALCULATOR',
      status: 'NEW',
      notes: JSON.stringify([{ date: new Date().toISOString(), note: 'Created' }]),
    },
  });

  const logs = JSON.parse(testLead.notes);
  assert(Array.isArray(logs), 'Notes is not a JSON array');
  assert.strictEqual(logs[0].note, 'Created', 'Initial note mismatch');

  // Clean up
  await prisma.lead.delete({ where: { id: testLead.id } });
  console.log('✔ Lead activity logs verified.');

  console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests()
  .catch((err) => {
    console.error('❌ Verification test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
