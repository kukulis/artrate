/**
 * Example test showing how to use MockEmailService with AuthService
 * This is a demonstration file - adapt it to your actual test setup
 */

import { AuthService } from './AuthService';
import { MockEmailService } from './MockEmailService';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { PasswordHashService } from './PasswordHashService';
import { TokenService } from './TokenService';
import { CaptchaService } from './CaptchaService';
import { RegisterUserDTO } from '../entities/User';

describe('AuthService - Email Integration', () => {
    let authService: AuthService;
    let mockEmail: MockEmailService;
    let userRepository: jest.Mocked<UserRepository>;
    let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
    let passwordHashService: jest.Mocked<PasswordHashService>;
    let tokenService: jest.Mocked<TokenService>;
    let captchaService: jest.Mocked<CaptchaService>;

    beforeEach(() => {
        // Create mock email service
        mockEmail = new MockEmailService();

        // Mock other dependencies (simplified - adjust based on your setup)
        userRepository = {
            findByEmail: jest.fn(),
            create: jest.fn(),
        } as any;

        refreshTokenRepository = {} as any;
        passwordHashService = {
            hash: jest.fn().mockResolvedValue('hashed_password')
        } as any;
        tokenService = {} as any;
        captchaService = {
            verify: jest.fn().mockResolvedValue(true)
        } as any;

        // Create AuthService with mocked dependencies
        authService = new AuthService(
            userRepository,
            refreshTokenRepository,
            passwordHashService,
            tokenService,
            captchaService,
            mockEmail // Use MockEmailService
        );
    });

    afterEach(() => {
        mockEmail.reset();
    });

    test('should send confirmation email when user registers', async () => {
        // Arrange
        const registerData: RegisterUserDTO = {
            email: 'newuser@example.com',
            name: 'New User',
            password: 'Password123',
            captchaToken: 'valid-token'
        };

        userRepository.findByEmail.mockResolvedValue(null); // User doesn't exist
        userRepository.create.mockResolvedValue({
            id: 1,
            email: 'newuser@example.com',
            name: 'New User',
            password_hash: 'hashed',
            is_active: false,
            role: 'user',
            confirm_token: 'generated-token',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Act
        await authService.register(registerData);

        // Assert - Verify email was sent
        expect(mockEmail.wasCalled('sendConfirmationEmail')).toBe(true);
        expect(mockEmail.getCallCount('sendConfirmationEmail')).toBe(1);

        // Verify email was sent to correct address
        const lastCall = mockEmail.getLastCallFor('sendConfirmationEmail');
        expect(lastCall?.args[0]).toBe('newuser@example.com');

        // Verify a token was provided
        expect(lastCall?.args[1]).toBeTruthy();
        expect(typeof lastCall?.args[1]).toBe('string');
    });

    test('should send password reset email when requested', async () => {
        // Arrange
        const email = 'user@example.com';
        userRepository.findByEmail.mockResolvedValue({
            id: 1,
            email: email,
            name: 'Test User',
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

        userRepository.setPasswordResetToken = jest.fn().mockResolvedValue(undefined);

        tokenService.generatePasswordResetToken = jest.fn().mockReturnValue('reset-token-123');
        tokenService.getPasswordResetExpiration = jest.fn().mockReturnValue(new Date());

        // Act
        await authService.requestPasswordReset(email);

        // Assert - Verify email was sent
        expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(true);
        expect(mockEmail.wasCalledWith('sendPasswordResetEmail', email, 'reset-token-123')).toBe(true);

        const lastCall = mockEmail.getLastCallFor('sendPasswordResetEmail');
        expect(lastCall?.args[0]).toBe(email);
        expect(lastCall?.args[1]).toBe('reset-token-123');
    });

    test('should not send email if user does not exist for password reset', async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(null);

        // Act
        await authService.requestPasswordReset('nonexistent@example.com');

        // Assert - No email should be sent
        expect(mockEmail.wasCalled('sendPasswordResetEmail')).toBe(false);
        expect(mockEmail.getCallCount()).toBe(0);
    });

    test('should track all email calls during session', async () => {
        // Arrange - Set up mocks for registration
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.create.mockResolvedValue({
            id: 1,
            email: 'user1@example.com',
            name: 'User 1',
            password_hash: 'hashed',
            is_active: false,
            role: 'user',
            confirm_token: 'token1',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Act - Register two users
        await authService.register({
            email: 'user1@example.com',
            name: 'User 1',
            password: 'Password123',
            captchaToken: 'token'
        });

        userRepository.create.mockResolvedValue({
            id: 2,
            email: 'user2@example.com',
            name: 'User 2',
            password_hash: 'hashed',
            is_active: false,
            role: 'user',
            confirm_token: 'token2',
            password_reset_token: null,
            password_reset_expires: null,
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date()
        });

        await authService.register({
            email: 'user2@example.com',
            name: 'User 2',
            password: 'Password123',
            captchaToken: 'token'
        });

        // Assert - Check all calls
        const allCalls = mockEmail.getCalls();
        expect(allCalls.length).toBe(2);
        expect(allCalls[0].method).toBe('sendConfirmationEmail');
        expect(allCalls[1].method).toBe('sendConfirmationEmail');
        expect(allCalls[0].args[0]).toBe('user1@example.com');
        expect(allCalls[1].args[0]).toBe('user2@example.com');
    });
});
