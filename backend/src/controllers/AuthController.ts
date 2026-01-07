import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import {
    RegisterUserSchema,
    LoginUserSchema,
    PasswordResetRequestSchema,
    PasswordResetConfirmSchema
} from '../entities/User';
import { ControllerHelper } from './ControllerHelper';
import { logger, wrapError } from '../logging';

export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * POST /api/auth/register
     * Register a new user
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = RegisterUserSchema.parse(req.body);

            // Get IP address for CAPTCHA verification
            const ipAddress = req.ip || req.socket.remoteAddress;

            // Register user
            const authResponse = await this.authService.register(validatedData, ipAddress);

            res.status(201).json(authResponse);
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error during registration', wrapError(error));
                return;
            }

            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    logger.warn('Registration failed: User already exists', { email: req.body.email });
                    res.status(409).json({ error: error.message });
                    return;
                }

                if (error.message.includes('CAPTCHA')) {
                    logger.warn('Registration failed: CAPTCHA verification failed');
                    res.status(400).json({ error: error.message });
                    return;
                }
            }

            logger.error('Error during registration', wrapError(error));
            res.status(500).json({
                error: 'Registration failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/login
     * Login user
     */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validatedData = LoginUserSchema.parse(req.body);

            // Login user
            const authResponse = await this.authService.login(validatedData);

            res.json(authResponse);
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error during login', wrapError(error));
                return;
            }

            if (error instanceof Error) {
                if (error.message.includes('Invalid email or password') ||
                    error.message.includes('disabled')) {
                    logger.warn('Login failed', { email: req.body.email, reason: error.message });
                    res.status(401).json({ error: error.message });
                    return;
                }
            }

            logger.error('Error during login', wrapError(error));
            res.status(500).json({
                error: 'Login failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/refresh
     * Refresh access token
     */
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            const authResponse = await this.authService.refreshToken(refreshToken);

            res.json(authResponse);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid or expired')) {
                logger.warn('Token refresh failed', wrapError(error));
                res.status(401).json({ error: error.message });
                return;
            }

            logger.error('Error refreshing token', wrapError(error));
            res.status(500).json({
                error: 'Token refresh failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/logout
     * Logout user (revoke refresh token)
     */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            await this.authService.logout(refreshToken);

            res.status(204).send();
        } catch (error) {
            logger.error('Error during logout', wrapError(error));
            res.status(500).json({
                error: 'Logout failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/password-reset/request
     * Request password reset
     */
    requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const validatedData = PasswordResetRequestSchema.parse(req.body);

            await this.authService.requestPasswordReset(validatedData.email);

            // Always return success to prevent email enumeration
            res.json({
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error in password reset request', wrapError(error));
                return;
            }

            logger.error('Error requesting password reset', wrapError(error));
            res.status(500).json({
                error: 'Password reset request failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/password-reset/confirm
     * Confirm password reset with token
     */
    confirmPasswordReset = async (req: Request, res: Response): Promise<void> => {
        try {
            const validatedData = PasswordResetConfirmSchema.parse(req.body);

            await this.authService.resetPassword(
                validatedData.token,
                validatedData.newPassword
            );

            res.json({ message: 'Password reset successful' });
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error in password reset confirmation', wrapError(error));
                return;
            }

            if (error instanceof Error && error.message.includes('Invalid or expired')) {
                logger.warn('Password reset failed: Invalid token', wrapError(error));
                res.status(400).json({ error: error.message });
                return;
            }

            logger.error('Error confirming password reset', wrapError(error));
            res.status(500).json({
                error: 'Password reset failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
