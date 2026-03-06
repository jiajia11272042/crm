import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const users = [
    { username: 'admin', password: hashedPassword, role: 'admin', name: '管理员' },
    { username: 'auditor', password: hashedPassword, role: 'auditor', name: '审核员' },
    { username: 'operator', password: hashedPassword, role: 'operator', name: '操作员' },
    { username: 'category', password: hashedPassword, role: 'category', name: '分类管理员' },
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { username: user.username }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user
      });
      console.log(`Created user: ${user.username}`);
    } else {
      console.log(`User ${user.username} already exists`);
    }
  }

  const categories = [
    { name: '通讯', nameEn: 'Communication', hasWhitelist: false, needRsaApproval: false, needLegalReview: false },
    { name: '约会', nameEn: 'Dating', hasWhitelist: true, needRsaApproval: false, needLegalReview: true },
    { name: '金融-银行', nameEn: 'Finance-Bank', hasWhitelist: false, needRsaApproval: false, needLegalReview: true },
    { name: '金融-加密货币', nameEn: 'Finance-Crypto', hasWhitelist: false, needRsaApproval: true, needLegalReview: true },
  ];

  for (const category of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name }
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category ${category.name} already exists`);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
