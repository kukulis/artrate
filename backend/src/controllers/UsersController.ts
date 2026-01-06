import { Request, Response } from 'express';

export class UsersController {
    /**
     * Get current user
     * In this version, always returns the hardcoded admin user
     */
    getCurrentUser = async (_req: Request, res: Response): Promise<void> => {
        try {
            const currentUser = {
                id: 1,
                name: 'admin',
                email: 'admin@darbelis.eu'
            };

            res.json(currentUser);
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(500).json({
                error: 'Failed to get current user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
