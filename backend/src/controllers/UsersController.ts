import { Request, Response } from 'express';
import { AuthenticationHandler } from './AuthenticationHandler';
import { logger, wrapError } from '../logging';

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
            logger.error('Error getting current user', wrapError(error));
            res.status(500).json({
                error: 'Failed to get current user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
