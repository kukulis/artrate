import { Router } from 'express';
import { Pool } from 'mysql2/promise';
import { AuthController } from '../controllers/AuthController';
import { AdminController } from '../controllers/AdminController';
import { AuthService } from '../services/AuthService';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { PasswordHashService } from '../services/PasswordHashService';
import { TokenService } from '../services/TokenService';
import { CaptchaService } from '../services/CaptchaService';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';

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

    const authService = new AuthService(
        userRepository,
        refreshTokenRepository,
        passwordHashService,
        tokenService,
        captchaService
    );

    const authController = new AuthController(authService);
    const adminController = new AdminController(userRepository);

    // Public authentication routes
    router.post('/register', authController.register);
    router.post('/login', authController.login);
    router.post('/refresh', authController.refreshToken);
    router.post('/logout', authController.logout);
    router.post('/password-reset/request', authController.requestPasswordReset);
    router.post('/password-reset/confirm', authController.confirmPasswordReset);

    // Admin routes (protected)
    const authMiddleware = authenticateToken(userRepository, tokenService);
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

    return router;
}
