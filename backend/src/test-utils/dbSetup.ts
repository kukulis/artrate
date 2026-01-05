import {connectDatabase} from '../config/database';
import knex from 'knex';
import knexConfig from '../../knexfile';

/**
 * Verify we're using a test database
 * Safety check to prevent running tests against production database
 */
function ensureTestDatabase() {
    const dbName = process.env.DB_NAME || '';

    if (!dbName.includes('test_')) {
        throw new Error(
            `❌ SAFETY CHECK FAILED: Database name '${dbName}' does not contain 'test_'. ` +
            `Tests can only run against test databases (e.g., artc_tst_db). ` +
            `Set DB_HOST environment variable to a test database.`
        );
    }

    console.log(`✅ Safety check passed: Using test database '${dbName}'`);
}

/**
 * Set up test database
 * - Verifies it's a test database
 * - Runs migrations
 * - Clears existing data
 */
export async function setupTestDatabase() {
    // Safety check: ensure we're using test database
    ensureTestDatabase();

    const config = knexConfig.development;
    const db = knex(config);

    try {
        // Run migrations to create tables
        await db.migrate.latest();
        console.log('✅ Test database migrations completed');
    } catch (error) {
        console.error('❌ Error running migrations:', error);
        throw error;
    } finally {
        await db.destroy();
    }
}

/**
 * Clean all tables in test database
 * Deletes all data but keeps table structure
 */
export async function cleanTestDatabase() {
    // Safety check: ensure we're using test database
    ensureTestDatabase();

    const connection = await connectDatabase();

    try {
        // Disable foreign key checks to allow truncation
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Get all tables
        const [tables] = await connection.query<any[]>(
            "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
            [process.env.DB_NAME || '']
        );

        // Truncate each table (except migrations table)
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            if (tableName !== 'knex_migrations' && tableName !== 'knex_migrations_lock') {
                await connection.query(`TRUNCATE TABLE ${tableName}`);
            }
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Test database cleaned');
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

/**
 * Tear down test database
 * - Rolls back migrations (optional, usually keep structure)
 */
export async function teardownTestDatabase() {
    await cleanTestDatabase();
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(maxAttempts = 30, delayMs = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const connection = await connectDatabase();
            await connection.query('SELECT 1');
            await connection.end();
            console.log('✅ Database is ready');
            return;
        } catch (error) {
            if (attempt === maxAttempts) {
                throw new Error('Database not ready after maximum attempts');
            }
            console.log(`⏳ Waiting for database... (attempt ${attempt}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}
