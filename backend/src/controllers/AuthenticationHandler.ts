import { Request } from 'express';
import { TokenService } from '../services/TokenService';
import { UserRepository } from '../repositories/UserRepository';

/**
 * Handles authentication and user extraction from requests
 * Extracts user from JWT token in Authorization header
 * Supports development mode with AUTH_ENABLED=false
 */
export class AuthenticationHandler {
    private authEnabled: boolean;

    constructor(
        private userRepository: UserRepository,
        private tokenService: TokenService
    ) {
        // Read AUTH_ENABLED from environment (defaults to true)
        this.authEnabled = process.env.AUTH_ENABLED !== 'false';
    }

    /**
     * Get the current authenticated user from the request
     * @throws Error if token is invalid or user not found
     */
    async getUser(req: Request): Promise<{ id: number; email: string; name: string; role: string }> {
        // If auth is disabled (for development), return hardcoded admin user
        if (!this.authEnabled) {
            return {
                id: 1,
                email: 'admin@darbelis.eu',
                name: 'admin',
                role: 'admin'
            };
        }

        // Production path: Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new Error('No authentication token provided');
        }

        // Verify and decode token
        const payload = this.tokenService.verifyAccessToken(token);

        // Get user from database
        const user = await this.userRepository.findById(payload.userId);

        if (!user || !user.is_active) {
            throw new Error('User not found or disabled');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
    }
}
