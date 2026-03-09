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
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        role VARCHAR(50) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_en VARCHAR(100),
        has_whitelist TINYINT(1) DEFAULT 0,
        need_rsa_approval TINYINT(1) DEFAULT 0,
        need_legal_review TINYINT(1) DEFAULT 0,
        creator VARCHAR(50),
        editor VARCHAR(50),
        description TEXT,
        remark VARCHAR(500),
        deleted TINYINT(1) DEFAULT 0,
        deleted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    const hashedPassword = bcrypt.hashSync('123456', 10);
    
    await prisma.$executeRaw`INSERT IGNORE INTO users (username, password, name, role) VALUES ('admin', ${hashedPassword}, '系统管理员', 'admin')`;
    
    await prisma.$executeRaw`INSERT IGNORE INTO categories (name, name_en, has_whitelist, need_rsa_approval, need_legal_review, creator) VALUES ('工具', 'Tools', 0, 0, 0, 'admin'), ('社交类', 'Social', 0, 0, 0, 'admin'), ('金融', 'Finance', 0, 1, 1, 'admin'), ('游戏', 'Game', 0, 0, 0, 'admin')`;
    
    res.json({ code: 200, data: { success: true }, msg: '初始化成功' });
  } catch (error) {
    console.error('Init error:', error);
    res.json({ code: 500, data: null, msg: '初始化失败: ' + String(error) });
  }
});

export default app;
