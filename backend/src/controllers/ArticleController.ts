import { Request, Response } from 'express';
import { ArticleService } from '../services/ArticleService';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  /**
   * GET /api/articles
   * Get all articles
   */
  getAllArticles = async (req: Request, res: Response): Promise<void> => {
    try {
      const articles = await this.articleService.getAllArticles();
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
      const { id } = req.params;
      const article = await this.articleService.getArticleById(id);

      if (!article) {
        res.status(404).json({ error: `Article with id ${id} not found` });
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
      const { authorId } = req.params;
      const articles = await this.articleService.getArticlesByAuthorId(authorId);
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
      const { title, author_id, content } = req.body;

      // Validate request body
      if (!title || !author_id || !content) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['title', 'author_id', 'content']
        });
        return;
      }

      const article = await this.articleService.createArticle({
        title,
        author_id,
        content
      });

      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating article:', error);

      if (error instanceof Error && error.message.includes('does not exist')) {
        res.status(400).json({ error: error.message });
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
      const { id } = req.params;
      const { title, author_id, content } = req.body;

      // Check if at least one field is provided
      if (!title && !author_id && !content) {
        res.status(400).json({
          error: 'At least one field is required for update',
          allowed: ['title', 'author_id', 'content']
        });
        return;
      }

      const article = await this.articleService.updateArticle(id, {
        title,
        author_id,
        content
      });

      res.json(article);
    } catch (error) {
      console.error('Error updating article:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error instanceof Error && error.message.includes('does not exist')) {
        res.status(400).json({ error: error.message });
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
      const { id } = req.params;
      await this.articleService.deleteArticle(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting article:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to delete article',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
