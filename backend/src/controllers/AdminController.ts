import { Request, Response } from 'express';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { UserRepository } from '../repositories/UserRepository';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { RankingRepository } from '../repositories/RankingRepository';
import { GeminiService } from '../services/GeminiService';
import { GeminiPromptBuilder } from '../services/GeminiPromptBuilder';
import { getLogger, wrapError } from '../logging';
import { SafeUser } from '../entities/User';
import { RankingHelper } from '../types/RankingHelper';

const logger = getLogger();

// Validation schema for AI ranking evaluation request
const EvaluateRankingSchema = z.object({
    articleId: z.string().min(1, 'Article ID is required'),
    helperType: z.string().min(1, 'Helper type is required')
});

// Validation schema for role update request
const UpdateRoleSchema = z.object({
    role: z.enum(['user', 'admin'])
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
        private articleRepository: ArticleRepository,
        private geminiService: GeminiService,
        private rankingRepository: RankingRepository
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

            const article = await this.articleRepository.findById(articleId);

            if (!article) {
                res.status(404).json({ error: 'Article not found' });

                return;
            }

            const userId = (req as any).user?.userId;

            logger.info('AI ranking evaluation requested', {
                articleId,
                helperType,
                adminId: userId
            });

            // Build prompt using GeminiPromptBuilder
            const builder = new GeminiPromptBuilder();
            const instructions = `${GeminiPromptBuilder.JSON_FORMAT_INSTRUCTION}

${GeminiPromptBuilder.QUESTIONS}`;

            const prompt = builder.buildPrompt({
                article: {
                    title: article.title,
                    content: article.content
                },
                questions: [],
                instructions: instructions
            });

            // Call Gemini API
            const response = await this.geminiService.generateContent(prompt);

            // Parse response into rankings
            const rankings = GeminiService.parseGeminiResponse(response.text);

            // Set missing fields on each ranking
            for (const ranking of rankings) {
                ranking.setId(randomBytes(16).toString('hex'));
                ranking.setUserId(userId);
                ranking.setHelperType(RankingHelper.GEMINI.code);
                ranking.setArticleId(articleId);
            }

            // Upsert rankings to database
            await this.rankingRepository.upsertRankings(rankings);

            logger.info('AI ranking evaluation completed', {
                articleId,
                helperType,
                rankingsCount: String(rankings.length)
            });

            res.json({
                articleId,
                helperType,
                status: 'completed',
                rankings: rankings.map(r => ({
                    type: r.ranking_type,
                    value: r.value,
                    description: r.description
                }))
            });
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

    /**
     * PATCH /api/auth/admin/users/:id/role
     * Update a user's role
     */
    updateUserRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.id);

            if (isNaN(userId)) {
                res.status(400).json({ error: 'Invalid user ID' });

                return;
            }


            // Validate request body
            const validationResult = UpdateRoleSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errors = validationResult.error.issues.map((issue: z.ZodIssue) => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
                res.status(400).json({ error: 'Validation failed', details: errors });

                return;
            }

            const { role } = validationResult.data;

            const user = await this.userRepository.findById(userId);

            if (!user) {
                res.status(404).json({ error: 'User not found' });

                return;
            }

            // Cannot change super_admin role
            if (user.role === 'super_admin') {
                res.status(403).json({ error: 'Cannot change super_admin role' });

                return;
            }

            // Update the role
            user.role = role;
            await this.userRepository.update(user);

            logger.info('User role updated', {
                userId: userId.toString(),
                newRole: role,
                adminId: (req as any).user?.userId
            });
            res.json({ message: 'User role updated successfully', user: toSafeUser(user) });
        } catch (error) {
            logger.error('Error updating user role', wrapError(error));
            res.status(500).json({
                error: 'Failed to update user role',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
