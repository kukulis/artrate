import apiClient from './api'

export interface Author {
  id: string
  name: string
  description: string
  created_at?: Date
  updated_at?: Date
}

/**
 * Service for Author-related API calls
 */
class AuthorService {
  /**
   * Get all authors
   */
  async getAll(): Promise<Author[]> {
    const response = await apiClient.get<Author[]>('/authors')
    return response.data
  }

  /**
   * Get a single author by ID
   */
  async getById(id: string): Promise<Author> {
    const response = await apiClient.get<Author>(`/authors/${id}`)
    return response.data
  }

  /**
   * Create a new author
   */
  async create(author: Omit<Author, 'id' | 'created_at' | 'updated_at'>): Promise<Author> {
    const response = await apiClient.post<Author>('/authors', author)
    return response.data
  }

  /**
   * Update an existing author
   */
  async update(id: string, author: Partial<Author>): Promise<Author> {
    const response = await apiClient.patch<Author>(`/authors/${id}`, author)
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
