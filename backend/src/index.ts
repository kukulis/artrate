import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, pool } from './config/database';
import apiRoutes from './routes';

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

// Database test endpoint
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

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);

  // TODO print routes dynamically
  console.log(`Available routes:`);
  console.log(`  - GET    /health`);
  console.log(`  - GET    /api/test`);
  console.log(`  - GET    /api/articles`);
  console.log(`  - POST   /api/articles`);
  console.log(`  - GET    /api/articles/:id`);
  console.log(`  - PATCH  /api/articles/:id`);
  console.log(`  - DELETE /api/articles/:id`);
  console.log(`  - GET    /api/articles/author/:authorId`);
  console.log(`  - GET    /api/authors`);
  console.log(`  - POST   /api/authors`);
  console.log(`  - GET    /api/authors/:id`);
  console.log(`  - PATCH  /api/authors/:id`);
  console.log(`  - DELETE /api/authors/:id`);
});

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Closing database pool...`);
  try {
    await pool.end();
    console.log('Database pool closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error closing pool:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
