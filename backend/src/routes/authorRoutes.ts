import { Router } from 'express';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { AuthorController } from '../controllers/AuthorController';
import { UserRepository } from '../repositories/UserRepository';
import { TokenService } from '../services/TokenService';
import { authenticateToken } from '../middleware/authMiddleware';
import { AuthenticationHandler } from '../controllers/AuthenticationHandler';
import { Pool } from 'mysql2/promise';

/**
 * Create author routes with a given connection pool
 * This allows tests to inject their own pool for better isolation
 */
export function createAuthorRoutes(dbPool: Pool) {
    const router = Router();

    // Dependency injection: wire dependencies together
    const authorRepository = new AuthorRepository(dbPool);
    const userRepository = new UserRepository(dbPool);
    const tokenService = new TokenService();
    const authenticationHandler = new AuthenticationHandler(userRepository, tokenService);
    const authorController = new AuthorController(authorRepository, authenticationHandler);

    // Create authentication middleware
    const authMiddleware = authenticateToken(userRepository, tokenService);

    /**
     * @route   GET /api/authors
     * @desc    Get all authors (supports ?search=name query parameter)
     * @access  Public
     */
    router.get('/', authorController.getAuthors);

    /**
     * @route   GET /api/authors/:id
     * @desc    Get author by ID
     * @access  Public
     */
    router.get('/:id', authorController.getAuthorById);

    /**
     * @route   POST /api/authors
     * @desc    Create a new author
     * @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.post('/', authMiddleware, authorController.createAuthor);

    /**
     * @route   PATCH /api/authors/:id
     * @desc    Update an author
     * @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.patch('/:id', authMiddleware, authorController.updateAuthor);

    /**
     * @route   DELETE /api/authors/:id
     * @desc    Delete an author
     * @access  Protected (controlled by AUTH_ENABLED config)
     */
    router.delete('/:id', authMiddleware, authorController.deleteAuthor);

    return router;
}

