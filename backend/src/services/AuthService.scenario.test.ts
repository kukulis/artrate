/**
 * Scenario Test: Complete User Registration and Login Flow
 * Tests the full lifecycle from registration to logout
 */

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

describe('AuthService - User Registration Flow Scenario', () => {
    let authService: AuthService;
    let mockEmail: MockEmailService;
    let userRepository: jest.Mocked<UserRepository>;
    let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
    let passwordHashService: jest.Mocked<PasswordHashService>;
    let tokenService: jest.Mocked<TokenService>;
    let captchaService: jest.Mocked<CaptchaService>;

    // Scenario state
    let createdUser: User;
    let confirmationToken: string;
    let userPassword: string;

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
            }
        });

        mockEmail = new MockEmailService();

        userRepository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
            findByConfirmationToken: jest.fn(),
            update: jest.fn(),
        } as any;

        refreshTokenRepository = {
            revoke: jest.fn(),
        } as any;

        passwordHashService = {
            hash: jest.fn(),
            compare: jest.fn(),
        } as any;

        tokenService = {} as any;
        captchaService = {} as any;

        authService = new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordHashService,
            tokenService,
            captchaService,
            mockEmail
        );

        // Reset scenario state
        userPassword = 'SecurePassword123';
    });

    it('SCENARIO: Complete user registration and login flow', async () => {
        // ============================================================
        // STEP 1: New user registers, should receive confirmation email
        // ============================================================
        const registerData: RegisterUserDTO = {
            email: 'newuser@example.com',
            name: 'New User',
            password: userPassword,
            captchaToken: 'token'
        };

        userRepository.findByEmail.mockResolvedValue(null);
        passwordHashService.hash.mockResolvedValue('hashed_password');

        createdUser = {
            id: 1,
            email: 'newuser@example.com',
            name: 'New User',
            password_hash: 'hashed_password',
            is_active: false,
            role: 'user',
            confirm_token: 'generated-confirm-token',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        };

        userRepository.create.mockResolvedValue(createdUser);

        await authService.register(registerData);

        // Verify confirmation email was sent
        expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(true);
        const emailCall = mockEmail.getLastCallFor('sendConfirmationEmail');
        expect(emailCall?.args[0]).toBe('newuser@example.com');

        // Extract confirmation token from email
        confirmationToken = emailCall?.args[1] as string;
        expect(confirmationToken).toBeTruthy();

        // ============================================================
        // STEP 1.5: User tries to login before confirmation, but fails
        // ============================================================
        const loginData: LoginUserDTO = {
            email: 'newuser@example.com',
            password: userPassword
        };

        userRepository.findByEmail.mockResolvedValue(createdUser);

        await expect(authService.login(loginData)).rejects.toThrow(
            'Account is disabled. Please contact administrator.'
        );

        // ============================================================
        // STEP 2: Confirmation URL used - token extracted and confirmed
        // ============================================================
        const userToConfirm = { ...createdUser };
        userRepository.findByConfirmationToken.mockResolvedValue(userToConfirm);

        const confirmResult = await authService.confirm(confirmationToken);

        expect(confirmResult).toBe(true);
        expect(userRepository.update).toHaveBeenCalledWith(
            expect.objectContaining({
                is_active: true,
                confirm_token: ''
            })
        );

        // Update our mock user to be active now
        createdUser.is_active = true;
        createdUser.confirm_token = null;

        // ============================================================
        // STEP 2.5: Wrong confirmation token tested
        // ============================================================
        userRepository.findByConfirmationToken.mockResolvedValue(null);

        const wrongTokenResult = await authService.confirm('wrong-token-123');

        expect(wrongTokenResult).toBe(false);

        // ============================================================
        // STEP 3: User successfully logs in with password
        // ============================================================
        userRepository.findByEmail.mockResolvedValue(createdUser);
        passwordHashService.compare.mockResolvedValue(true);

        const loggedInUser = await authService.login(loginData);

        expect(loggedInUser.id).toBe(createdUser.id);
        expect(loggedInUser.email).toBe('newuser@example.com');
        expect(userRepository.updateLastLogin).toHaveBeenCalledWith(createdUser.id);

        // ============================================================
        // STEP 3.5: User inputs wrong password to login
        // ============================================================
        const wrongPasswordData: LoginUserDTO = {
            email: 'newuser@example.com',
            password: 'WrongPassword123'
        };

        userRepository.findByEmail.mockResolvedValue(createdUser);
        passwordHashService.compare.mockResolvedValue(false);

        await expect(authService.login(wrongPasswordData)).rejects.toThrow(
            'Invalid email or password'
        );

        // ============================================================
        // STEP 4: User logs out
        // ============================================================
        const refreshToken = 'valid-refresh-token';

        await authService.logout(refreshToken);

        expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(refreshToken);

        // ============================================================
        // STEP 4.5: User tries to logout again
        // ============================================================
        refreshTokenRepository.revoke.mockClear();

        // Logging out with the same token again should still call revoke
        // (the repository handles if token is already revoked)
        await authService.logout(refreshToken);

        expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(refreshToken);
    });

    it('SCENARIO: Registration with existing email fails immediately', async () => {
        const registerData: RegisterUserDTO = {
            email: 'existing@example.com',
            name: 'Existing User',
            password: 'Password123',
            captchaToken: 'token'
        };

        // User already exists
        userRepository.findByEmail.mockResolvedValue({
            id: 1,
            email: 'existing@example.com',
            name: 'Existing User',
            password_hash: 'hashed',
            is_active: true,
            role: 'user',
            confirm_token: null,
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        await expect(authService.register(registerData)).rejects.toThrow(
            'User with this email already exists'
        );

        // No confirmation email should be sent
        expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(false);
    });

    it('SCENARIO: Multiple failed login attempts before confirmation', async () => {
        const registerData: RegisterUserDTO = {
            email: 'user@example.com',
            name: 'User',
            password: 'Password123',
            captchaToken: 'token'
        };

        userRepository.findByEmail.mockResolvedValue(null);
        passwordHashService.hash.mockResolvedValue('hashed_password');
        userRepository.create.mockResolvedValue({
            id: 1,
            email: 'user@example.com',
            name: 'User',
            password_hash: 'hashed_password',
            is_active: false,
            role: 'user',
            confirm_token: 'token',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        await authService.register(registerData);

        // Try to login 3 times before confirmation
        const loginData: LoginUserDTO = {
            email: 'user@example.com',
            password: 'Password123'
        };

        userRepository.findByEmail.mockResolvedValue({
            id: 1,
            email: 'user@example.com',
            name: 'User',
            password_hash: 'hashed_password',
            is_active: false, // Still not confirmed
            role: 'user',
            confirm_token: 'token',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        for (let i = 0; i < 3; i++) {
            await expect(authService.login(loginData)).rejects.toThrow(
                'Account is disabled. Please contact administrator.'
            );
        }

        // Verify updateLastLogin was never called
        expect(userRepository.updateLastLogin).not.toHaveBeenCalled();
    });
});
