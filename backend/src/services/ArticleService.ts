import {ArticleRepository} from '../repositories/ArticleRepository';
import {AuthorRepository} from '../repositories/AuthorRepository';
import {Article, CreateArticleDTO} from '../entities/Article';
import {randomBytes} from 'crypto';
import {AuthorFilterHelpers} from "../types/AuthorFilter";

export class ArticleService {
    private articleRepository: ArticleRepository;
    private authorRepository: AuthorRepository;

    constructor(articleRepository: ArticleRepository, authorRepository: AuthorRepository) {
        this.articleRepository = articleRepository;
        this.authorRepository = authorRepository;
    }

    /**
     * Generate a unique article ID
     */
    private generateId(): string {
        return randomBytes(16).toString('hex');
    }

    /**
     * Create a new article
     */
    async createArticle(data: CreateArticleDTO): Promise<Article> {
        // Validate author exists
        const existingAuthors = await this.authorRepository.find(AuthorFilterHelpers.byId(data.author_id));
        if (existingAuthors.length == 0) {
            throw new Error(`Author with id ${data.author_id} does not exist`);
        }

        // Validate required fields
        if (!data.title || data.title.trim().length === 0) {
            throw new Error('Title is required');
        }
        if (!data.content || data.content.trim().length === 0) {
            throw new Error('Content is required');
        }

        const articleWithId = {
            ...data,
            id: this.generateId()
        };

        return this.articleRepository.create(articleWithId as Article);
    }

    /**
     * Update an existing article
     */
    async updateArticle(data: Article): Promise<Article> {
        // Check if article exists
        const exists = await this.articleRepository.exists(data.id);
        if (!exists) {
            throw new Error(`Article with id ${data.id} not found`);
        }

        // If updating author_id, validate author exists
        if (data.author_id) {
            const existingAuthors = await this.authorRepository.find(AuthorFilterHelpers.byId(data.author_id));
            if (existingAuthors.length == 0) {
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

        const updated = await this.articleRepository.update(data);
        if (!updated) {
            throw new Error(`Failed to update article with id ${data.id}`);
        }

        return updated;
    }

}
