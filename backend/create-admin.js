const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@1234', 12);
  const admin = await p.user.upsert({
    where: { email: 'admin@vpn.com' },
    update: {},
    create: {
      email: 'admin@vpn.com',
      name: 'Super Admin',
      passwordHash: hash,
      role: 'admin',
      adminRole: 'super_admin',
      plan: 'enterprise',
      emailVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);
}

main().catch(console.error).finally(() => p.$disconnect());
