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

    // Create authentication middleware (checks AUTH_ENABLED internally)
    const authMiddleware = authenticateToken(userRepository, tokenService);

    /**
     * @route   GET /api/current-user
     * @desc    Get current authenticated user
     * @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.get('/current-user', authMiddleware, usersController.getCurrentUser);

    return router;
}
