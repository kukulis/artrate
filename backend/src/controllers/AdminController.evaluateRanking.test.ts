import { Request, Response } from 'express';
import { AdminController } from './AdminController';
import { UserRepository } from '../repositories/UserRepository';
import { ArticleRepository } from '../repositories/ArticleRepository';
import { RankingRepository } from '../repositories/RankingRepository';
import { GeminiService } from '../services/GeminiService';
import { AxiosError } from 'axios';

// Mock the logging module
jest.mock('../logging', () => ({
    getLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
    wrapError: (error: any) => ({ error: error?.message || 'Unknown error' }),
}));

describe('AdminController.evaluateRanking', () => {
    let controller: AdminController;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockArticleRepository: jest.Mocked<ArticleRepository>;
    let mockRankingRepository: jest.Mocked<RankingRepository>;
    let mockGeminiService: jest.Mocked<GeminiService>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseJson: jest.Mock;
    let responseStatus: jest.Mock;

    beforeEach(() => {
        // Create mocked repositories
        mockUserRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateLastLogin: jest.fn(),
            setPasswordResetToken: jest.fn(),
            findByPasswordResetToken: jest.fn(),
            updatePassword: jest.fn(),
            updateActiveStatus: jest.fn(),
            existsByEmail: jest.fn(),
            findByConfirmationToken: jest.fn(),
        } as unknown as jest.Mocked<UserRepository>;

        mockArticleRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByAuthorId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
            getAmountFromDate: jest.fn(),
        } as unknown as jest.Mocked<ArticleRepository>;

        mockRankingRepository = {
            findById: jest.fn(),
            findWithFilter: jest.fn(),
            createRanking: jest.fn(),
            updateRanking: jest.fn(),
            deleteRanking: jest.fn(),
            upsertRankings: jest.fn(),
        } as unknown as jest.Mocked<RankingRepository>;

        mockGeminiService = {
            isConfigured: jest.fn(),
            generateContent: jest.fn(),
            generateChat: jest.fn(),
        } as unknown as jest.Mocked<GeminiService>;

        // Create controller with mocked dependencies
        controller = new AdminController(
            mockUserRepository,
            mockArticleRepository,
            mockGeminiService,
            mockRankingRepository
        );

        // Setup mock response
        responseJson = jest.fn();
        responseStatus = jest.fn().mockReturnThis();
        mockResponse = {
            json: responseJson,
            status: responseStatus,
        };

        // Setup mock request with valid body and user
        mockRequest = {
            body: {
                articleId: 'test-article-123',
                helperType: 'GEMINI',
            },
            user: { userId: 1, email: 'admin@test.com', role: 'admin' as const },
        };
    });

    describe('when GeminiService returns 429 rate limit error', () => {
        it('should return 429 status with error details', async () => {
            // Arrange: Setup article to be found
            const mockArticle = {
                id: 'test-article-123',
                title: 'Test Article',
                content: 'Test content for evaluation',
                author_id: 'author-1',
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            };
            mockArticleRepository.findById.mockResolvedValue(mockArticle);

            // Arrange: Create a mock Axios 429 error
            const axiosError = new AxiosError(
                'Request failed with status code 429',
                'ERR_BAD_REQUEST',
                undefined,
                undefined,
                {
                    status: 429,
                    statusText: 'Too Many Requests',
                    headers: {
                        'retry-after': '60',
                    },
                    config: {} as any,
                    data: {
                        error: {
                            code: 429,
                            message: 'Resource has been exhausted (e.g. check quota).',
                            status: 'RESOURCE_EXHAUSTED',
                        },
                    },
                }
            );

            mockGeminiService.generateContent.mockRejectedValue(axiosError);

            // Act
            await controller.evaluateRanking(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(responseStatus).toHaveBeenCalledWith(429);
            expect(responseJson).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Rate limit exceeded',
                    message: 'Resource has been exhausted (e.g. check quota).',
                })
            );
        });
    });
});
