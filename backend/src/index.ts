import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/test', async (_req: Request, res: Response) => {
  try {
    const connection = await connectDatabase();
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    await connection.end();

    res.json({
      message: 'Backend is working!',
      database: 'Connected',
      queryResult: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      message: 'Backend is working but database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
