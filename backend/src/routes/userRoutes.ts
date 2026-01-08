import { Router } from 'express';
import { Pool } from 'mysql2/promise';
import { UsersController } from '../controllers/UsersController';
import { AuthenticationHandler } from '../controllers/AuthenticationHandler';
import { UserRepository } from '../repositories/UserRepository';
import { TokenService } from '../services/TokenService';
import { authenticateToken } from '../middleware/authMiddleware';

/**
 * Create user routes
 */
export function createUserRoutes(pool: Pool) {
    const router = Router();

    const userRepository = new UserRepository(pool);
    const tokenService = new TokenService();
    const authenticationHandler = new AuthenticationHandler(userRepository, tokenService);
    const usersController = new UsersController(authenticationHandler);

    // Check if auth is enabled
    console.log('createUserRoutes: process.env.AUTH_ENABLED:'+process.env.AUTH_ENABLED)
    // TODO no direct env access here
    const authEnabled = process.env.AUTH_ENABLED !== 'false';


    /**
     * @route   GET /api/current-user
     * @desc    Get current authenticated user
     * @access  Protected (if AUTH_ENABLED=true) / Public (if AUTH_ENABLED=false)
     */
    if (authEnabled) {
        const authMiddleware = authenticateToken(userRepository, tokenService);
        router.get('/current-user', authMiddleware, usersController.getCurrentUser);
    } else {
        router.get('/current-user', usersController.getCurrentUser);
    }

    return router;
}
