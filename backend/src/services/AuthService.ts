import {UserRepository} from '../repositories/UserRepository';
import {RefreshTokenRepository} from '../repositories/RefreshTokenRepository';
import {PasswordHashService} from './PasswordHashService';
import {TokenService} from './TokenService';
import {CaptchaService} from './CaptchaService';
import {EmailInterface} from './EmailService';
import {LoginUserDTO, RegisterUserDTO, User} from '../entities/User';
import {generateRandomString} from "../utils/crypto";
import {getConfig} from '../config';

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private refreshTokenRepository: RefreshTokenRepository,
        private passwordHashService: PasswordHashService,
        private tokenService: TokenService,
        private captchaService: CaptchaService,
        private emailService: EmailInterface
    ) {
    }

    /**
     * Register a new user
     */
    async register(
        data: RegisterUserDTO,
        ipAddress?: string
    ): Promise<User> {
        const config = getConfig();

        // Verify CAPTCHA
        if (config.captcha.enabled) {
            const captchaValid = await this.captchaService.verify(data.captchaToken, ipAddress);
            if (!captchaValid) {
                throw new Error('CAPTCHA verification failed');
            }
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.passwordHashService.hash(data.password);

        // Create user
        const confirmToken = generateRandomString(128);
        const user = await this.userRepository.create({
            email: data.email,
            name: data.name,
            password_hash: passwordHash,
            role: 'user',
            is_active: false,
            confirm_token: confirmToken
        });

        // Send confirmation email
        await this.emailService.sendConfirmationEmail(user.email, confirmToken);

        return user;
    }

    /**
     * Login user
     */
    async login(data: LoginUserDTO): Promise<User> {
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

        return user;
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<User> {
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

        return user;
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
    async requestPasswordReset(email: string, captchaToken: string, ipAddress?: string): Promise<void> {
        const config = getConfig();

        // Verify CAPTCHA if enabled
        if (config.captcha.enabled) {
            const captchaValid = await this.captchaService.verify(captchaToken, ipAddress);
            if (!captchaValid) {
                throw new Error('CAPTCHA verification failed');
            }
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            return;
        }

        // Check if there's already an unexpired reset token
        if (user.password_reset_token && user.password_reset_expires) {
            const now = new Date();
            if (user.password_reset_expires > now) {
                // Token still valid, don't send another email (prevents spam)
                return;
            }
        }

        // Generate reset token
        const resetToken = this.tokenService.generatePasswordResetToken();
        const expiresAt = this.tokenService.getPasswordResetExpiration();

        // Save token to database
        await this.userRepository.setPasswordResetToken(user.id, resetToken, expiresAt);

        // Send password reset email
        await this.emailService.sendPasswordResetEmail(user.email, resetToken);
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

    public async confirm(token: string): Promise<boolean> {
        const user = await this.userRepository.findByConfirmationToken(token);

        if (user === undefined || user === null) {
            return false;
        }

        user.confirm_token = ''
        user.is_active = true

        await this.userRepository.update(user);

        return true;
    }

    // /**
    //  * Remove sensitive fields from User object
    //  */
    // toSafeUser(user: User): SafeUser {
    //     const {password_hash, password_reset_token, password_reset_expires, ...safeUser} = user;
    //     return safeUser as SafeUser;
    // }
}
