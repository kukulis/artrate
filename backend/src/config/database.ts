import mysql from 'mysql2/promise';
import type { Pool, Connection } from 'mysql2/promise';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

/**
 * Pool configuration options
 */
export interface PoolConfig extends DatabaseConfig {
    waitForConnections?: boolean;
    connectionLimit?: number;
    queueLimit?: number;
}

/**
 * Global connection pool (singleton)
 * Initialized via initPool()
 */
let pool: Pool | null = null;

/**
 * Initialize the global connection pool
 * Must be called before using getPool()
 */
export function initPool(config: PoolConfig): Pool {
    if (pool) {
        console.warn('Database pool already initialized');
        return pool;
    }

    pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: config.waitForConnections ?? true,
        connectionLimit: config.connectionLimit ?? 10,
        queueLimit: config.queueLimit ?? 0,
    });

    console.log(`Database pool initialized: ${config.user}@${config.host}:${config.port}/${config.database}`);
    return pool;
}

/**
 * Get the global connection pool
 * Throws error if pool not initialized
 */
export function getPool(): Pool {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initPool() first.');
    }
    return pool;
}

/**
 * Create a single database connection
 * Use this for one-off queries or when you need a dedicated connection
 * Remember to call connection.end() when done
 *
 * @param config - Optional database configuration. If not provided, reads from environment variables.
 *
 */
export async function connectDatabase(config?: DatabaseConfig): Promise<Connection> {
    const dbConfig = config || {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'artcorrect_db',
    };

    const connection = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
    });

    return connection;
}

/**
 * Create a new connection pool with custom configuration
 * Use this if you need a pool with different settings than the global pool
 */
export function createConnectionPool(config: PoolConfig): Pool {
    return mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        waitForConnections: config.waitForConnections ?? true,
        connectionLimit: config.connectionLimit ?? 10,
        queueLimit: config.queueLimit ?? 0,
    });
}
