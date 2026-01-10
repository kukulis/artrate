/**
 * Test configuration
 * Provides configuration for test environments
 */

import type { DatabaseConfig } from './database';
import type { LoggerConfig } from '../logging';

/**
 * Get database configuration for tests
 * Reads from environment variables or uses defaults
 */
// TODO nobody calls it
export function getTestDatabaseConfig(): DatabaseConfig {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'artcorrect_db',
    };
}

/**
 * Get logger configuration for tests
 * Uses ConsoleLogger for tests
 */
// TODO nobody calls it
export function getTestLoggerConfig(): LoggerConfig {
    return {
        lokiUrl: '', // Use ConsoleLogger in tests
        environment: 'test',
    };
}
