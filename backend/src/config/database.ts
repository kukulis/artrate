import mysql from 'mysql2/promise';

// dotenv called in src/index.ts

/**
 * Global connection pool (singleton)
 * Created once when this module is first imported
 * Reuses connections across requests for better performance
 */
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'artcorrect_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Create a single database connection
 * Use this for one-off queries or when you need a dedicated connection
 * Remember to call connection.end() when done
 *
 */
export const connectDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'artcorrect_db',
  });

  return connection;
};

/**
 * Create a new connection pool with custom configuration
 * Use this if you need a pool with different settings than the global pool
 */
export const createConnectionPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'artcorrect_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};
