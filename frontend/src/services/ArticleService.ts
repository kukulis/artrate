import apiClient from './api'
import type {
    ArticleResponse,
    CreateArticleRequest,
    UpdateArticleRequest
} from '../types/api'

/**
 * Service for Article-related API calls
 */
class ArticleService {
    /**
     * Get all articles
     */
    async getAll(): Promise<ArticleResponse[]> {
        const response = await apiClient.get<ArticleResponse[]>('/articles')

        return response.data
    }

    /**
     * Get a single article by ID
     */
    async getById(id: string): Promise<ArticleResponse> {
        const response = await apiClient.get<ArticleResponse>(`/articles/${id}`)

        return response.data
    }

    /**
     * Create a new article
     */
    async create(article: CreateArticleRequest): Promise<ArticleResponse> {
        const response = await apiClient.post<ArticleResponse>('/articles', article)

        return response.data
    }

    /**
     * Update an existing article
     */
    async update(id: string, article: UpdateArticleRequest): Promise<ArticleResponse> {
        const response = await apiClient.patch<ArticleResponse>(`/articles/${id}`, article)

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
