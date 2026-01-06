import { Request } from 'express';
import { User } from '../types/User';

/**
 * Handles authentication and user extraction from requests
 * Currently returns a hardcoded user, but will be refactored to extract from JWT token
 */
export class AuthenticationHandler {
    /**
     * Get the current authenticated user from the request
     * @param _req - Express request object (will extract from token in future)
     * @returns User object
     */
    getUser(_req: Request): User {
        // TODO: In the future, extract user from JWT token in request headers
        // const token = req.headers.authorization?.split(' ')[1];
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // return await userRepository.findById(decoded.userId);

        // For now, return hardcoded admin user
        return {
            id: 101,
            name: 'admin',
            email: 'admin@darbelis.eu'
        };
    }
}
