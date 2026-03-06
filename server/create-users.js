const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUsers() {
  const password = await bcrypt.hash('123456', 10);
  
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password },
    create: { username: 'admin', password, role: 'admin', name: '系统管理员' }
  });
  
  await prisma.user.upsert({
    where: { username: 'operator' },
    update: { password },
    create: { username: 'operator', password, role: 'operator', name: '操作员' }
  });

  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (adminUser) {
    await prisma.userRole.deleteMany({ where: { userId: adminUser.id } });
    await prisma.userRole.create({ data: { userId: adminUser.id, role: 'admin' } });
    await prisma.userRole.create({ data: { userId: adminUser.id, role: 'approver' } });
    await prisma.userRole.create({ data: { userId: adminUser.id, role: 'category_admin' } });
    await prisma.userRole.create({ data: { userId: adminUser.id, role: 'operator' } });
  }

  console.log('测试用户密码已重置！');
}

createTestUsers()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
