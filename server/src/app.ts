import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import approvalsRouter from './routes/approvals';
import usersRouter from './routes/users';

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


export default app;
