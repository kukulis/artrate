import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { PasswordHashService } from './PasswordHashService';
import { TokenService } from './TokenService';
import { CaptchaService } from './CaptchaService';
import { RegisterUserDTO, LoginUserDTO, User, SafeUser } from '../entities/User';

export interface AuthResponse {
    user: SafeUser;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository,
        private passwordHashService: PasswordHashService,
        private tokenService: TokenService,
        private captchaService: CaptchaService
    ) {}

    /**
     * Register a new user
     */
    async register(
        data: RegisterUserDTO,
        ipAddress?: string
    ): Promise<AuthResponse> {
        // Verify CAPTCHA
        const captchaValid = await this.captchaService.verify(data.captchaToken, ipAddress);
        if (!captchaValid) {
            throw new Error('CAPTCHA verification failed');
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.passwordHashService.hash(data.password);

        // Create user
        const user = await this.userRepository.create({
            email: data.email,
            name: data.name,
            password_hash: passwordHash,
            role: 'user'
        });

        // Generate tokens
        return this.generateAuthResponse(user);
    }

    /**
     * Login user
     */
    async login(data: LoginUserDTO): Promise<AuthResponse> {
        // Find user by email
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.is_active) {
            throw new Error('Account is disabled. Please contact administrator.');
        }

        // Verify password
        if (!user.password_hash) {
            throw new Error('Invalid email or password');
        }

        const passwordValid = await this.passwordHashService.compare(
            data.password,
            user.password_hash
        );
        if (!passwordValid) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        await this.userRepository.updateLastLogin(user.id);

        // Generate tokens
        return this.generateAuthResponse(user);
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        // Find refresh token in database
        const tokenRecord = await this.refreshTokenRepository.findByToken(refreshToken);
        if (!tokenRecord) {
            throw new Error('Invalid or expired refresh token');
        }

        // Get user
        const user = await this.userRepository.findById(tokenRecord.user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if user is active
        if (!user.is_active) {
            throw new Error('Account is disabled');
        }

        // Revoke old refresh token
        await this.refreshTokenRepository.revoke(refreshToken);

        // Generate new tokens
        return this.generateAuthResponse(user);
    }

    /**
     * Logout user (revoke refresh token)
     */
    async logout(refreshToken: string): Promise<void> {
        await this.refreshTokenRepository.revoke(refreshToken);
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            return;
        }

        // Generate reset token
        const resetToken = this.tokenService.generatePasswordResetToken();
        const expiresAt = this.tokenService.getPasswordResetExpiration();

        // Save token to database
        await this.userRepository.setPasswordResetToken(user.id, resetToken, expiresAt);

        // TODO: Send email with reset link
        // For now, just log it (in production, integrate with email service)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: http://your-frontend-url/reset-password?token=${resetToken}`);
    }

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<void> {
        // Find user by reset token
        const user = await this.userRepository.findByPasswordResetToken(token);
        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        // Hash new password
        const passwordHash = await this.passwordHashService.hash(newPassword);

        // Update password and clear reset token
        await this.userRepository.updatePassword(user.id, passwordHash);

        // Revoke all refresh tokens for security
        await this.refreshTokenRepository.revokeAllForUser(user.id);
    }

    /**
     * Generate authentication response with tokens
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

    /**
     * Remove sensitive fields from User object
     */
    toSafeUser(user: User): SafeUser {
        const { password_hash, password_reset_token, password_reset_expires, ...safeUser } = user;
        return safeUser as SafeUser;
    }
}
