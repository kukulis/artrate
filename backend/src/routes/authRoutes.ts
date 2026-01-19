import { Router } from 'express';
import { Pool } from 'mysql2/promise';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { PasswordHashService } from '../services/PasswordHashService';
import { TokenService } from '../services/TokenService';
import { CaptchaService } from '../services/CaptchaService';
import { GeminiService } from '../services/GeminiService';
import { EmailInterface, EmailService } from '../services/EmailService';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { getConfig } from '../config';

/**
 * Create authentication routes
 */
export function createAuthRoutes(pool: Pool) {
    const router = Router();

    // Initialize services and repositories
    const userRepository = new UserRepository(pool);
    const refreshTokenRepository = new RefreshTokenRepository(pool);
    const passwordHashService = new PasswordHashService();
    const tokenService = new TokenService();
    const captchaService = new CaptchaService();
    const emailService: EmailInterface = new EmailService();

    const authService = new AuthService(
        userRepository,
        refreshTokenRepository,
        passwordHashService,
        tokenService,
        captchaService,
        emailService
    );

    const articleRepository = new ArticleRepository(pool);

    const config = getConfig();
    const geminiService = new GeminiService(
        config.gemini.apiKey,
        config.gemini.model
    );

    const authController = new AuthController(
        authService,
        tokenService,
        refreshTokenRepository
    );
    const adminController = new AdminController(
        userRepository,
        articleRepository,
        geminiService
    );

    // Create authentication middleware
    const authMiddleware = authenticateToken(userRepository, tokenService);

    // Public authentication routes (no auth required)
    router.post('/register', authController.register);
    router.post('/login', authController.login);
    router.post('/refresh', authController.refreshToken);
    router.post('/password-reset/request', authController.requestPasswordReset);
    router.post('/password-reset/confirm', authController.confirmPasswordReset);
    router.get('/confirm', authController.confirm);

    // Protected authentication routes
    router.post('/logout', authMiddleware, authController.logout);

    // Admin routes (protected)
    router.get(
        '/admin/users',
        authMiddleware,
        requireAdmin,
        adminController.getUsers
    );
    router.get(
        '/admin/users/:id',
        authMiddleware,
        requireAdmin,
        adminController.getUserById
    );
    router.patch(
        '/admin/users/:id/disable',
        authMiddleware,
        requireAdmin,
        adminController.disableUser
    );
    router.patch(
        '/admin/users/:id/enable',
        authMiddleware,
        requireAdmin,
        adminController.enableUser
    );
    router.patch(
        '/admin/users/:id/role',
        authMiddleware,
        requireAdmin,
        adminController.updateUserRole
    );
    router.post(
        '/admin/rankings/evaluate',
        authMiddleware,
        requireAdmin,
        adminController.evaluateRanking
    );

    return router;
}
