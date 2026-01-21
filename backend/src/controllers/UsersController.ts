import { Request, Response } from 'express';
import { AuthenticationHandler } from './AuthenticationHandler';
import { UserRepository } from '../repositories/UserRepository';
import {getLogger, wrapError} from '../logging';

const logger = getLogger()

export class UsersController {
    constructor(
        private authenticationHandler: AuthenticationHandler,
        private userRepository: UserRepository
    ) {}

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

    /**
     * Get user name by ID (public endpoint)
     */
    getUserNameById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.id, 10);

            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });

                return;
            }

            const user = await this.userRepository.findById(userId);

            if (!user) {
                res.status(404).json({ error: 'User not found' });

                return;
            }

            res.json({ id: user.id, name: user.name });
        } catch (error) {
            logger.error('Error getting user name', wrapError(error));
            res.status(500).json({
                error: 'Failed to get user name',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
