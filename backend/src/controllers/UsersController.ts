import { Request, Response } from 'express';
import { AuthenticationHandler } from './AuthenticationHandler';
import {getLogger, wrapError} from '../logging';

const logger = getLogger()

export class UsersController {
    constructor(private authenticationHandler: AuthenticationHandler) {}

    /**
     * Get current authenticated user
     * Uses AuthenticationHandler to extract user from JWT token
     */
    getCurrentUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const currentUser = await this.authenticationHandler.getUser(req);
            res.json(currentUser);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('No authentication token') ||
                    error.message.includes('User not found') ||
                    error.message.includes('disabled')) {
                    logger.warn('Unauthorized access to current user', wrapError(error));
                    res.status(401).json({ error: error.message });
                    return;
                }
            }

            logger.error('Error getting current user', wrapError(error));
            res.status(500).json({
                error: 'Failed to get current user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
