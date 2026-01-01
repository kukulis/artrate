import { ArticleRepository } from '../repositories/ArticleRepository';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { Article, CreateArticleDTO, UpdateArticleDTO } from '../entities/Article';
import { randomBytes } from 'crypto';

export class ArticleService {
  private articleRepository: ArticleRepository;
  private authorRepository: AuthorRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
    this.authorRepository = new AuthorRepository();
  }

  /**
   * Generate a unique article ID
   */
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Get all articles
   */
  async getAllArticles(): Promise<Article[]> {
    return this.articleRepository.findAll();
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<Article | null> {
    return this.articleRepository.findById(id);
  }

  /**
   * Get articles by author ID
   */
  async getArticlesByAuthorId(authorId: string): Promise<Article[]> {
    return this.articleRepository.findByAuthorId(authorId);
  }

  /**
   * Create a new article
   */
  async createArticle(data: Omit<CreateArticleDTO, 'id'>): Promise<Article> {
    // Validate author exists
    const authorExists = await this.authorRepository.exists(data.author_id);
    if (!authorExists) {
      throw new Error(`Author with id ${data.author_id} does not exist`);
    }

    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Content is required');
    }

    // Create article with generated ID
    const articleData: CreateArticleDTO = {
      id: this.generateId(),
      title: data.title.trim(),
      author_id: data.author_id,
      content: data.content.trim()
    };

    return this.articleRepository.create(articleData);
  }

  /**
   * Update an existing article
   */
  async updateArticle(id: string, data: UpdateArticleDTO): Promise<Article> {
    // Check if article exists
    const exists = await this.articleRepository.exists(id);
    if (!exists) {
      throw new Error(`Article with id ${id} not found`);
    }

    // If updating author_id, validate author exists
    if (data.author_id) {
      const authorExists = await this.authorRepository.exists(data.author_id);
      if (!authorExists) {
        throw new Error(`Author with id ${data.author_id} does not exist`);
      }
    }

    // Validate fields if provided
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (data.content !== undefined && data.content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // Trim strings
    const updateData: UpdateArticleDTO = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.author_id !== undefined) updateData.author_id = data.author_id;

    const updated = await this.articleRepository.update(id, updateData);
    if (!updated) {
      throw new Error(`Failed to update article with id ${id}`);
    }

    return updated;
  }

  /**
   * Delete an article
   */
  async deleteArticle(id: string): Promise<void> {
    const deleted = await this.articleRepository.delete(id);
    if (!deleted) {
      throw new Error(`Article with id ${id} not found`);
    }
  }

  /**
   * Check if article exists
   */
  async articleExists(id: string): Promise<boolean> {
    return this.articleRepository.exists(id);
  }
}
