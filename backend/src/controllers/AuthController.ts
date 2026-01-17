import {Request, Response} from 'express';
import {AuthService} from '../services/AuthService';
import {TokenService} from '../services/TokenService';
import {RefreshTokenRepository} from '../repositories/RefreshTokenRepository';
import {
    LoginUserSchema,
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    RegisterUserSchema,
    User,
    SafeUser
} from '../entities/User';
import {ControllerHelper} from './ControllerHelper';
import {getLogger, wrapError} from '../logging';

const logger = getLogger();

export interface AuthResponse {
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
}

export class AuthController {
    constructor(
        private authService: AuthService,
        private tokenService: TokenService,
        private refreshTokenRepository: RefreshTokenRepository
    ) {
    }

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
            const user = await this.authService.register(validatedData, ipAddress);

            // Generate authentication response with tokens
            // const authResponse = await this.generateAuthResponse(user);

            res.status(201).json({user: { email: user.email}});
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error during registration', wrapError(error));
                return;
            }

            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    logger.warn('Registration failed: User already exists', {email: req.body.email});
                    res.status(409).json({error: error.message});
                    return;
                }

                if (error.message.includes('CAPTCHA')) {
                    logger.warn('Registration failed: CAPTCHA verification failed');
                    res.status(400).json({error: error.message});
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
            const user = await this.authService.login(validatedData);

            // Generate authentication response with tokens
            const authResponse = await this.generateAuthResponse(user);

            res.json(authResponse);
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error during login', wrapError(error));
                return;
            }

            if (error instanceof Error) {
                if (error.message.includes('Invalid email or password') ||
                    error.message.includes('disabled')) {
                    logger.warn('Login failed', {email: req.body.email, reason: error.message});
                    res.status(401).json({error: error.message});
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
            const {refreshToken} = req.body;

            if (!refreshToken) {
                res.status(400).json({error: 'Refresh token is required'});
                return;
            }

            const user = await this.authService.refreshToken(refreshToken);

            // Generate authentication response with tokens
            const authResponse = await this.generateAuthResponse(user);

            res.json(authResponse);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Invalid or expired')) {
                logger.warn('Token refresh failed', wrapError(error));
                res.status(401).json({error: error.message});
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
            const {refreshToken} = req.body;

            if (!refreshToken) {
                res.status(400).json({error: 'Refresh token is required'});
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

            // Get IP address for CAPTCHA verification
            const ipAddress = req.ip || req.socket.remoteAddress;

            await this.authService.requestPasswordReset(
                validatedData.email,
                validatedData.captchaToken,
                ipAddress
            );

            // Always return success to prevent email enumeration
            res.json({
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error in password reset request', wrapError(error));
                return;
            }

            if (error instanceof Error && error.message.includes('CAPTCHA')) {
                logger.warn('Password reset failed: CAPTCHA verification failed');
                res.status(400).json({error: error.message});
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
                validatedData.password
            );

            res.json({message: 'Password reset successful'});
        } catch (error) {
            if (ControllerHelper.handleZodError(error, res)) {
                logger.warn('Validation error in password reset confirmation', wrapError(error));
                return;
            }

            if (error instanceof Error && error.message.includes('Invalid or expired')) {
                logger.warn('Password reset failed: Invalid token', wrapError(error));
                res.status(400).json({error: error.message});
                return;
            }

            logger.error('Error confirming password reset', wrapError(error));
            res.status(500).json({
                error: 'Password reset failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * GET /api/auth/confirm?token=<token>
     * Confirm user email with token
     */
    confirm = async (req: Request, res: Response): Promise<void> => {
        try {
            const {token} = req.query;

            if (!token || typeof token !== 'string') {
                res.status(400).json({error: 'Confirmation token is required'});
                return;
            }

            const confirmed = await this.authService.confirm(token);
            if ( !confirmed ) {
                res.status(400).json({error: "User confirmation failed", message: "User confirmation failed"});
                return
            }

            res.json({message: 'User confirmed successfully'});
        } catch (error) {
            logger.error('User confirming email', wrapError(error));
            res.status(500).json({
                error: 'User confirmation failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Generate authentication response with tokens
     * This method handles HTTP-specific response formatting
     */
    private async generateAuthResponse(user: User): Promise<AuthResponse> {
        // Generate access token
        const accessToken = this.tokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Generate refresh token
        const refreshToken = this.tokenService.generateRefreshToken();
        const refreshExpiresAt = this.tokenService.getRefreshTokenExpiration();

        // Save refresh token to database
        await this.refreshTokenRepository.create({
            user_id: user.id,
            token: refreshToken,
            expires_at: refreshExpiresAt
        });

        // Return safe user (without password hash)
        const safeUser: SafeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            is_active: user.is_active,
            role: user.role,
            last_login_at: user.last_login_at,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        return {
            user: safeUser,
            accessToken,
            refreshToken
        };
    }
}
