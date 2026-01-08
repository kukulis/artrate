import express, {Request, Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {pool, connectDatabase} from './config/database';
import {createRouter} from "./routes";
import {logger, wrapError} from "./logging";

dotenv.config();

const apiRoutes = createRouter(pool)

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
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
        logger.error('database error', wrapError(error))
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

/**
 * Extract all routes from an Express router recursively
 */
function getRoutes(router: any, basePath = ''): string[] {
    const routes: string[] = [];

    if (!router.stack) return routes;

    router.stack.forEach((layer: any) => {
        if (layer.route) {
            // This is a route layer with HTTP methods
            const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
            const path = basePath + layer.route.path;
            methods.forEach(method => {
                routes.push(`  - ${method.padEnd(6)} ${path}`);
            });
        } else if (layer.name === 'router' && layer.handle.stack) {
            // This is a nested router - extract its base path and recurse
            const regexp = layer.regexp.toString();
            const match = regexp.match(/^\/\^\\\/([^\\?]+)/);
            const nestedPath = match ? `/${match[1]}` : '';
            routes.push(...getRoutes(layer.handle, basePath + nestedPath));
        }
    });

    return routes;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);

    // Print all routes dynamically
    console.log(`Available routes:`);
    const allRoutes = getRoutes((app as any)._router);
    allRoutes.forEach(route => console.log(route));
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
