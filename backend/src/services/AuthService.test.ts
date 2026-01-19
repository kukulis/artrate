import { AuthService } from './AuthService';
import { MockEmailService } from './MockEmailService';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { PasswordHashService } from './PasswordHashService';
import { TokenService } from './TokenService';
import { CaptchaService } from './CaptchaService';
import { RegisterUserDTO, LoginUserDTO, User } from '../entities/User';
import { AppConfig } from '../config';

// Mock the config module
jest.mock('../config', () => ({
    getConfig: jest.fn()
}));

const mockGetConfig = require('../config').getConfig as jest.MockedFunction<() => AppConfig>;

describe('AuthService', () => {
    let authService: AuthService;
    let mockEmail: MockEmailService;
    let userRepository: jest.Mocked<UserRepository>;
    let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
    let passwordHashService: jest.Mocked<PasswordHashService>;
    let tokenService: jest.Mocked<TokenService>;
    let captchaService: jest.Mocked<CaptchaService>;

    const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'hashed_password',
        is_active: true,
        role: 'user',
        confirm_token: null,
        password_reset_token: null,
        password_reset_expires: null,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date()
    };

    beforeEach(() => {
        // Mock config with default values
        mockGetConfig.mockReturnValue({
            port: 3000,
            nodeEnv: 'test',
            database: {
                host: 'localhost',
                port: 3306,
                user: 'test',
                password: 'test',
                database: 'test'
            },
            logging: { lokiUrl: '' },
            cors: { allowedOrigins: [] },
            email: {
                smtpHost: 'localhost',
                smtpPort: 587,
                smtpSecure: false,
                smtpUser: 'test@test.com',
                smtpPassword: 'test',
                from: 'test@test.com'
            },
            site: { url: 'http://localhost:3000' },
            captcha: {
                enabled: false,
                secretKey: '',
                siteKey: ''
            },
            auth: {
                enabled: false
            },
            gemini: {
                apiKey: '',
                model: 'gemini-2.0-flash'
            }
        });

        mockEmail = new MockEmailService();

        userRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
            setPasswordResetToken: jest.fn(),
            findByPasswordResetToken: jest.fn(),
            updatePassword: jest.fn(),
            findByConfirmationToken: jest.fn(),
            update: jest.fn(),
        } as any;

        refreshTokenRepository = {
            findByToken: jest.fn(),
            revoke: jest.fn(),
            revokeAllForUser: jest.fn(),
        } as any;

        passwordHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        } as any;

        tokenService = {
            generatePasswordResetToken: jest.fn(),
            getPasswordResetExpiration: jest.fn(),
        } as any;

        captchaService = {
            verify: jest.fn(),
        } as any;

        authService = new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordHashService,
            tokenService,
            captchaService,
            mockEmail
        );
    });

    afterEach(() => {
        mockEmail.reset();
    });

    describe('register', () => {
        const registerData: RegisterUserDTO = {
            email: 'newuser@example.com',
            name: 'New User',
            password: 'Password123',
            captchaToken: 'valid-token'
        };


        it('should create user with hashed password', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            passwordHashService.hash.mockResolvedValue('hashed_password');
            userRepository.create.mockResolvedValue({ ...mockUser, is_active: false });

            await authService.register(registerData);

            expect(passwordHashService.hash).toHaveBeenCalledWith('Password123');
            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'newuser@example.com',
                    name: 'New User',
                    password_hash: 'hashed_password',
                    role: 'user',
                    is_active: false,
                })
            );
        });

        it('should send confirmation email with token', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            passwordHashService.hash.mockResolvedValue('hashed_password');
            userRepository.create.mockResolvedValue({
                ...mockUser,
                email: 'newuser@example.com',
                name: 'New User',
                is_active: false
            });

            await authService.register(registerData);

            expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(true);
            const call = mockEmail.getLastCallFor('sendConfirmationEmail');
            expect(call?.args[0]).toBe('newuser@example.com');
            expect(call?.args[1]).toBeTruthy();
            expect(typeof call?.args[1]).toBe('string');
        });

        it('should set user as inactive', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            passwordHashService.hash.mockResolvedValue('hashed_password');
            userRepository.create.mockResolvedValue({ ...mockUser, is_active: false });

            await authService.register(registerData);

            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ is_active: false })
            );
        });

        it('should fail if user already exists', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);

            await expect(authService.register(registerData)).rejects.toThrow(
                'User with this email already exists'
            );

            expect(userRepository.create).not.toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(false);
        });

        it('should fail if CAPTCHA verification fails when enabled', async () => {
            // Enable CAPTCHA for this test
            mockGetConfig.mockReturnValue({
                ...mockGetConfig(),
                captcha: { enabled: true, secretKey: 'test', siteKey: 'test' }
            });

            userRepository.findByEmail.mockResolvedValue(null);
            captchaService.verify.mockResolvedValue(false);

            await expect(authService.register(registerData)).rejects.toThrow(
                'CAPTCHA verification failed'
            );

            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const loginData: LoginUserDTO = {
            email: 'test@example.com',
            password: 'Password123'
        };

        it('should return user on successful login', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            passwordHashService.compare.mockResolvedValue(true);

            const result = await authService.login(loginData);

            expect(result).toEqual(mockUser);
        });

        it('should update last login timestamp', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            passwordHashService.compare.mockResolvedValue(true);

            await authService.login(loginData);

            expect(userRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
        });

        it('should fail if user not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await expect(authService.login(loginData)).rejects.toThrow(
                'Invalid email or password'
            );
        });

        it('should fail if user is inactive', async () => {
            userRepository.findByEmail.mockResolvedValue({ ...mockUser, is_active: false });

            await expect(authService.login(loginData)).rejects.toThrow(
                'Account is disabled. Please contact administrator.'
            );
        });

        it('should fail if password is incorrect', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            passwordHashService.compare.mockResolvedValue(false);

            await expect(authService.login(loginData)).rejects.toThrow(
                'Invalid email or password'
            );
        });
    });

    describe('refreshToken', () => {
        const refreshToken = 'valid-refresh-token';
        const tokenRecord = {
            id: 1,
            user_id: 1,
            token: refreshToken,
            expires_at: new Date(),
            is_revoked: false,
            user_agent: null,
            ip_address: null,
            created_at: new Date()
        };

        it('should return user with valid refresh token', async () => {
            refreshTokenRepository.findByToken.mockResolvedValue(tokenRecord);
            userRepository.findById.mockResolvedValue(mockUser);

            const result = await authService.refreshToken(refreshToken);

            expect(result).toEqual(mockUser);
        });

        it('should revoke old refresh token', async () => {
            refreshTokenRepository.findByToken.mockResolvedValue(tokenRecord);
            userRepository.findById.mockResolvedValue(mockUser);

            await authService.refreshToken(refreshToken);

            expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(refreshToken);
        });

        it('should fail if refresh token not found', async () => {
            refreshTokenRepository.findByToken.mockResolvedValue(null);

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
                'Invalid or expired refresh token'
            );
        });

        it('should fail if user not found', async () => {
            refreshTokenRepository.findByToken.mockResolvedValue(tokenRecord);
            userRepository.findById.mockResolvedValue(null);

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
                'User not found'
            );
        });

        it('should fail if user is inactive', async () => {
            refreshTokenRepository.findByToken.mockResolvedValue(tokenRecord);
            userRepository.findById.mockResolvedValue({ ...mockUser, is_active: false });

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
                'Account is disabled'
            );
        });
    });

    describe('requestPasswordReset', () => {
        const email = 'test@example.com';
        const captchaToken = 'valid-captcha-token';
        const resetToken = 'reset-token-123';
        const expiresAt = new Date();

        it('should generate reset token and send email', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            tokenService.generatePasswordResetToken.mockReturnValue(resetToken);
            tokenService.getPasswordResetExpiration.mockReturnValue(expiresAt);

            await authService.requestPasswordReset(email, captchaToken);

            expect(tokenService.generatePasswordResetToken).toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(true);
            expect(mockEmail.wasCalledWith('sendPasswordResetEmail', email, resetToken)).toBe(true);
        });

        it('should save token to database', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            tokenService.generatePasswordResetToken.mockReturnValue(resetToken);
            tokenService.getPasswordResetExpiration.mockReturnValue(expiresAt);

            await authService.requestPasswordReset(email, captchaToken);

            expect(userRepository.setPasswordResetToken).toHaveBeenCalledWith(
                mockUser.id,
                resetToken,
                expiresAt
            );
        });

        it('should silently succeed if user not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            await authService.requestPasswordReset(email, captchaToken);

            expect(tokenService.generatePasswordResetToken).not.toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(false);
        });

        it('should not send email if unexpired token already exists', async () => {
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 1);

            const userWithToken = {
                ...mockUser,
                password_reset_token: 'existing-token',
                password_reset_expires: futureDate
            };

            userRepository.findByEmail.mockResolvedValue(userWithToken);

            await authService.requestPasswordReset(email, captchaToken);

            expect(tokenService.generatePasswordResetToken).not.toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(false);
        });

        it('should send email if previous token expired', async () => {
            const pastDate = new Date();
            pastDate.setHours(pastDate.getHours() - 1);

            const userWithExpiredToken = {
                ...mockUser,
                password_reset_token: 'expired-token',
                password_reset_expires: pastDate
            };

            userRepository.findByEmail.mockResolvedValue(userWithExpiredToken);
            tokenService.generatePasswordResetToken.mockReturnValue(resetToken);
            tokenService.getPasswordResetExpiration.mockReturnValue(expiresAt);

            await authService.requestPasswordReset(email, captchaToken);

            expect(tokenService.generatePasswordResetToken).toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(true);
        });

        it('should fail if CAPTCHA verification fails when enabled', async () => {
            // Enable CAPTCHA for this test
            mockGetConfig.mockReturnValue({
                ...mockGetConfig(),
                captcha: { enabled: true, secretKey: 'test', siteKey: 'test' }
            });

            captchaService.verify.mockResolvedValue(false);

            await expect(authService.requestPasswordReset(email, captchaToken)).rejects.toThrow(
                'CAPTCHA verification failed'
            );

            expect(userRepository.findByEmail).not.toHaveBeenCalled();
            expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(false);
        });
    });

    describe('resetPassword', () => {
        const token = 'valid-reset-token';
        const newPassword = 'NewPassword123';

        it('should update password with valid token', async () => {
            userRepository.findByPasswordResetToken.mockResolvedValue(mockUser);
            passwordHashService.hash.mockResolvedValue('new_hashed_password');

            await authService.resetPassword(token, newPassword);

            expect(passwordHashService.hash).toHaveBeenCalledWith(newPassword);
            expect(userRepository.updatePassword).toHaveBeenCalledWith(
                mockUser.id,
                'new_hashed_password'
            );
        });

        it('should revoke all user refresh tokens', async () => {
            userRepository.findByPasswordResetToken.mockResolvedValue(mockUser);
            passwordHashService.hash.mockResolvedValue('new_hashed_password');

            await authService.resetPassword(token, newPassword);

            expect(refreshTokenRepository.revokeAllForUser).toHaveBeenCalledWith(mockUser.id);
        });

        it('should fail if token invalid or expired', async () => {
            userRepository.findByPasswordResetToken.mockResolvedValue(null);

            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
                'Invalid or expired reset token'
            );

            expect(userRepository.updatePassword).not.toHaveBeenCalled();
        });
    });

    describe('confirm', () => {
        const token = 'confirmation-token';

        it('should activate user with valid token', async () => {
            const inactiveUser = { ...mockUser, is_active: false, confirm_token: token };
            userRepository.findByConfirmationToken.mockResolvedValue(inactiveUser);

            const result = await authService.confirm(token);

            expect(result).toBe(true);
            expect(userRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_active: true,
                    confirm_token: ''
                })
            );
        });

        it('should clear confirmation token', async () => {
            const inactiveUser = { ...mockUser, confirm_token: token };
            userRepository.findByConfirmationToken.mockResolvedValue(inactiveUser);

            await authService.confirm(token);

            expect(userRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({ confirm_token: '' })
            );
        });

        it('should return false if token not found', async () => {
            userRepository.findByConfirmationToken.mockResolvedValue(null);

            const result = await authService.confirm(token);

            expect(result).toBe(false);
            expect(userRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should revoke refresh token', async () => {
            const refreshToken = 'token-to-revoke';

            await authService.logout(refreshToken);

            expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(refreshToken);
        });
    });
});
