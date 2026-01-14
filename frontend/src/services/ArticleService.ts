import apiClient from './api'
import type {Article} from '../types/article'
import AuthenticationHandler from "./AuthenticationHandler.ts";

/**
 * Service for Article-related API calls
 */
class ArticleService {
    /**
     * Get all articles
     */
    async getAll(): Promise<Article[]> {
        const response = await apiClient.get<Article[]>('/articles')
        return response.data
    }

    /**
     * Get a single article by ID
     */
    async getById(id: string): Promise<Article> {
        const response = await apiClient.get<Article>(`/articles/${id}`)
        return response.data
    }

    /**
     * Create a new article
     */
    async create(article: Omit<Article, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Article> {
        const response = await apiClient.post<Article>('/articles', article)

        return response.data
    }

    /**
     * Update an existing article
     */
    async update(id: string, article: Partial<Article>): Promise<Article> {
        const response = await apiClient.patch<Article>(`/articles/${id}`, article)

        return response.data
    }

    /**
     * Delete an article
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/articles/${id}`)
    }
}

// Export a singleton instance
export default new ArticleService()
