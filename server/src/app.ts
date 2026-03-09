import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import approvalsRouter from './routes/approvals';
import usersRouter from './routes/users';

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'http://localhost:8000',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    msg: '服务正常'
  });
});

app.post('/api/init', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const now = new Date();
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: bcrypt.hashSync('123456', 10),
        name: '系统管理员',
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    });
    
    await prisma.category.createMany({
      data: [
        { name: '工具', nameEn: 'Tools', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '', createdAt: now, updatedAt: now },
        { name: '社交类', nameEn: 'Social', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '', createdAt: now, updatedAt: now },
        { name: '金融', nameEn: 'Finance', hasWhitelist: false, needRsaApproval: true, needLegalReview: true, creator: 'admin', editor: '', description: '', remark: '', createdAt: now, updatedAt: now },
        { name: '游戏', nameEn: 'Game', hasWhitelist: false, needRsaApproval: false, needLegalReview: false, creator: 'admin', editor: '', description: '', remark: '', createdAt: now, updatedAt: now },
      ],
      skipDuplicates: true,
    });
    
    res.json({ code: 200, data: { user: admin }, msg: '初始化成功' });
  } catch (error) {
    console.error('Init error:', error);
    res.json({ code: 500, data: null, msg: '初始化失败' });
  }
});


export default app;
