import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { pool } from './db';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import paymentRoutes from './routes/payments';
import receiptRoutes from './routes/receipts';
import reportRoutes from './routes/reports';
import financeRoutes from './routes/finances';
import { ApiError } from './utils/ApiError';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: (err as Error).message });
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/finances', financeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Not found.', code: 'NOT_FOUND' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: true, message: err.message, code: err.code });
  }
  console.error(err);
  res.status(500).json({ error: true, message: 'Internal server error.', code: 'INTERNAL_ERROR' });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
