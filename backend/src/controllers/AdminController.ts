import { Request, Response } from 'express';
import { z } from 'zod';
import { UserRepository } from '../repositories/UserRepository';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { getLogger, wrapError } from '../logging';
import { SafeUser } from '../entities/User';
import { RankingHelper } from '../types/RankingHelper';

const logger = getLogger();

// Validation schema for AI ranking evaluation request
const EvaluateRankingSchema = z.object({
    articleId: z.string().min(1, 'Article ID is required'),
    helperType: z.string().min(1, 'Helper type is required')
});

/**
 * Convert User to SafeUser (remove sensitive fields)
 */
function toSafeUser(user: any): SafeUser {
    const { password_hash, password_reset_token, password_reset_expires, confirm_token, ...safeUser } = user;

    return safeUser as SafeUser;
}

export class AdminController {
    constructor(
        private userRepository: UserRepository,
        private articleRepository?: ArticleRepository
    ) {}

    /**
     * GET /api/auth/admin/users
     * Get all users list
     */
    getUsers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.userRepository.findAll();
            const safeUsers = users.map(toSafeUser);

            logger.info('Users list retrieved', { count: String(users.length) });
            res.json({ users: safeUsers });
        } catch (error) {
            logger.error('Error retrieving users list', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve users',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * GET /api/auth/admin/users/:id
     * Get user by ID
     */
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });

                return;
            }

            const user = await this.userRepository.findById(userId);

            if (!user) {
                res.status(404).json({ error: 'User not found' });

                return;
            }

            logger.info('User retrieved', { userId: userId.toString() });
            res.json({ user: toSafeUser(user) });
        } catch (error) {
            logger.error('Error retrieving user', wrapError(error));
            res.status(500).json({
                error: 'Failed to retrieve user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/auth/admin/rankings/evaluate
     * Execute ranking evaluation with AI
     */
    evaluateRanking = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate request body
            const validationResult = EvaluateRankingSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errors = validationResult.error.issues.map((issue: z.ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
                res.status(400).json({ error: 'Validation failed', details: errors });

                return;
            }

            const { articleId, helperType } = validationResult.data;

            // Validate helper type
            const validHelperTypes = RankingHelper.getAll().map(h => h.code);
            if (!validHelperTypes.includes(helperType)) {
                res.status(400).json({
                    error: 'Invalid helper type',
                    validTypes: validHelperTypes
                });

                return;
            }

            // Check if article exists
            if (!this.articleRepository) {
                res.status(500).json({ error: 'Article repository not configured' });

                return;
            }

            const article = await this.articleRepository.findById(articleId);

            if (!article) {
                res.status(404).json({ error: 'Article not found' });

                return;
            }

            // TODO: Implement actual AI evaluation based on helperType
            // For now, return a placeholder response indicating the evaluation was triggered
            logger.info('AI ranking evaluation requested', {
                articleId,
                helperType,
                adminId: (req as any).user?.userId
            });

            // Placeholder for AI evaluation result
            const evaluationResult = {
                articleId,
                helperType,
                status: 'pending',
                message: `AI evaluation with ${helperType} has been triggered for article ${articleId}`,
                article: {
                    id: article.id,
                    title: article.title
                }
            };

            res.json(evaluationResult);
        } catch (error) {
            logger.error('Error executing AI ranking evaluation', wrapError(error));
            res.status(500).json({
                error: 'Failed to execute AI ranking evaluation',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

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

            const user = await this.userRepository.findById(userId)

            if (!user) {
                res.status(404).json({ error: 'User not found' });

                return;
            }


            if ( user?.role === 'super_admin') {
                res.status(403).json({ error: 'Not allowed to disable this user' });

                return
            }

            user.is_active = false;

            await this.userRepository.update(user);

            logger.info('User disabled', { userId: userId.toString(), adminId: (req as any).user?.userId });
            res.json({ message: 'User disabled successfully', user: toSafeUser(user) });
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
            res.json({ message: 'User enabled successfully', user: toSafeUser(user) });
        } catch (error) {
            logger.error('Error enabling user', wrapError(error));
            res.status(500).json({
                error: 'Failed to enable user',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
