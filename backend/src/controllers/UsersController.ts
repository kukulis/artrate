import { Request, Response } from 'express';
import { AuthenticationHandler } from './AuthenticationHandler';

export class UsersController {
    constructor(private authenticationHandler: AuthenticationHandler) {}

    /**
     * Get current authenticated user
     * Uses AuthenticationHandler to extract user from request
     */
    getCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const currentUser = this.authenticationHandler.getUser(req);
            res.json(currentUser);
        } catch (error) {
            // TODO debugging for ts
            // TODO find a better way to log errors
            console.error('Error getting current user:', error);
            res.status(500).json({
                error: 'Failed to get current user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
