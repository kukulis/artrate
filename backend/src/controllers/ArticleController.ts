import {Request, Response} from 'express';
import {ArticleService} from '../services/ArticleService';
import {ArticleRepository} from "../repositories/ArticleRepository";
import {Article, CreateArticleSchema, UpdateArticleSchema} from "../entities";
import {ControllerHelper} from "./ControllerHelper";

export class ArticleController {
    private articleService: ArticleService;
    private articleRepository: ArticleRepository;


    constructor(articleService: ArticleService, articleRepository: ArticleRepository) {
        this.articleService = articleService;
        this.articleRepository = articleRepository;
    }

    /**
     * @deprecated cant get all articles
     * GET /api/articles
     * Get all articles
     */
    getAllArticles = async (_req: Request, res: Response): Promise<void> => {
        try {
            const articles = await this.articleRepository.findAll();
            res.json(articles);
        } catch (error) {
            console.error('Error getting articles:', error);
            res.status(500).json({
                error: 'Failed to retrieve articles',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * GET /api/articles/:id
     * Get article by ID
     */
    getArticleById = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;
            const article = await this.articleRepository.findById(id);

            if (!article) {
                res.status(404).json({error: `Article with id ${id} not found`});
                return;
            }

            res.json(article);
        } catch (error) {
            console.error('Error getting article:', error);
            res.status(500).json({
                error: 'Failed to retrieve article',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * GET /api/articles/author/:authorId
     * Get articles by author ID
     */
    getArticlesByAuthorId = async (req: Request, res: Response): Promise<void> => {
        try {
            const {authorId} = req.params;
            const articles = await this.articleRepository.findByAuthorId(authorId);
            res.json(articles);
        } catch (error) {
            console.error('Error getting articles by author:', error);
            res.status(500).json({
                error: 'Failed to retrieve articles',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/articles
     * Create a new article
     */
    createArticle = async (req: Request, res: Response): Promise<void> => {
        try {
            // Validate and parse request body with Zod
            // const validatedData = CreateArticleSchema.parse(req.body);
            const validatedData = CreateArticleSchema.parse(req.body);

            const created = await this.articleService.createArticle(validatedData);

            res.status(201).json(created);
        } catch (error) {
            if ( ControllerHelper.handleZodError(error, res )) {
                return
            }

            console.error('Error creating article:', error);

            if (error instanceof Error && error.message.includes('does not exist')) {
                res.status(400).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to create article',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * PATCH /api/articles/:id
     * Update an existing article
     */
    updateArticle = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            // Validate and parse request body with Zod
            const validatedData = UpdateArticleSchema.parse(req.body);

            const updated = await this.articleService.updateArticle({
                ...validatedData,
                id
            } as Article);

            res.json(updated);
        } catch (error) {
            // Handle Zod validation errors
            if ( ControllerHelper.handleZodError(error, res )) {
                return
            }

            console.error('Error updating article:', error);

            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({error: error.message});
                return;
            }

            if (error instanceof Error && error.message.includes('does not exist')) {
                res.status(400).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to update article',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * DELETE /api/articles/:id
     * Delete an article
     */
    deleteArticle = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            const success = await this.articleRepository.delete(id);
            if (!success) {
                res.status(404).send({error: 'failed to delete'})
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Error deleting article:', error);

            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to delete article',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
