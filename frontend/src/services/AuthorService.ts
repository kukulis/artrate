import apiClient from './api'
import type {
    AuthorResponse,
    CreateAuthorRequest,
    UpdateAuthorRequest
} from '../types/api'

/**
 * Service for Author-related API calls
 */
class AuthorService {
    /**
     * Get all authors
     */
    async getAll(): Promise<AuthorResponse[]> {
        const response = await apiClient.get<AuthorResponse[]>('/authors')

        return response.data
    }

    /**
     * Get a single author by ID
     */
    async getById(id: string): Promise<AuthorResponse> {
        const response = await apiClient.get<AuthorResponse>(`/authors/${id}`)

        return response.data
    }

    /**
     * Create a new author
     */
    async create(author: CreateAuthorRequest): Promise<AuthorResponse> {
        const response = await apiClient.post<AuthorResponse>('/authors', author)

        return response.data
    }

    /**
     * Update an existing author
     */
    async update(id: string, author: UpdateAuthorRequest): Promise<AuthorResponse> {
        const response = await apiClient.patch<AuthorResponse>(`/authors/${id}`, author)

        return response.data
    }

    /**
     * Delete an author
     */
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/authors/${id}`)
    }
}

// Export a singleton instance
export default new AuthorService()
