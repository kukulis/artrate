import { Request, Response } from 'express';
import { AuthorService } from '../services/AuthorService';

export class AuthorController {
  private authorService: AuthorService;

  constructor() {
    this.authorService = new AuthorService();
  }

  /**
   * GET /api/authors
   * Get all authors or search by name
   */
  getAllAuthors = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = req.query;

      if (search && typeof search === 'string') {
        const authors = await this.authorService.searchAuthors(search);
        res.json(authors);
      } else {
        const authors = await this.authorService.getAllAuthors();
        res.json(authors);
      }
    } catch (error) {
      console.error('Error getting authors:', error);
      res.status(500).json({
        error: 'Failed to retrieve authors',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/authors/:id
   * Get author by ID
   */
  getAuthorById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const author = await this.authorService.getAuthorById(id);

      if (!author) {
        res.status(404).json({ error: `Author with id ${id} not found` });
        return;
      }

      res.json(author);
    } catch (error) {
      console.error('Error getting author:', error);
      res.status(500).json({
        error: 'Failed to retrieve author',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * POST /api/authors
   * Create a new author
   */
  createAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description } = req.body;

      // Validate request body
      if (!name || !description) {
        res.status(400).json({
          error: 'Missing required fields',
          required: ['name', 'description']
        });
        return;
      }

      const author = await this.authorService.createAuthor({
        name,
        description
      });

      res.status(201).json(author);
    } catch (error) {
      console.error('Error creating author:', error);

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to create author',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * PATCH /api/authors/:id
   * Update an existing author
   */
  updateAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Check if at least one field is provided
      if (!name && !description) {
        res.status(400).json({
          error: 'At least one field is required for update',
          allowed: ['name', 'description']
        });
        return;
      }

      const author = await this.authorService.updateAuthor(id, {
        name,
        description
      });

      res.json(author);
    } catch (error) {
      console.error('Error updating author:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to update author',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * DELETE /api/authors/:id
   * Delete an author
   */
  deleteAuthor = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.authorService.deleteAuthor(id);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting author:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }

      res.status(500).json({
        error: 'Failed to delete author',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
