import app from './app';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');
    
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKES = 0`;
    
    try {
      await prisma.user.create({
        data: {
          username: 'admin_init',
          password: 'dummy',
          name: 'init',
          role: 'admin',
        },
      });
      await prisma.user.delete({ where: { username: 'admin_init' } });
    } catch (e) {}
    
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKES = 1`;
    console.log('Database tables verified');
  } catch (error) {
    console.error('Database connection error:', error);
  }
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
