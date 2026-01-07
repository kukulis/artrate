import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { logger, wrapError } from '../logging';

export class AdminController {
    constructor(private userRepository: UserRepository) {}

    /**
     * PATCH /api/auth/admin/users/:id/disable
     * Disable a user account
     */
    disableUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const user = await this.userRepository.updateActiveStatus(userId, false);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            logger.info('User disabled', { userId: userId.toString(), adminId: (req as any).user?.userId });
            res.json({ message: 'User disabled successfully', user });
        } catch (error) {
            logger.error('Error disabling user', wrapError(error));
            res.status(500).json({
                error: 'Failed to disable user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * PATCH /api/auth/admin/users/:id/enable
     * Enable a user account
     */
    enableUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });
                return;
            }

            const user = await this.userRepository.updateActiveStatus(userId, true);

            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            logger.info('User enabled', { userId: userId.toString(), adminId: (req as any).user?.userId });
            res.json({ message: 'User enabled successfully', user });
        } catch (error) {
            logger.error('Error enabling user', wrapError(error));
            res.status(500).json({
                error: 'Failed to enable user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
