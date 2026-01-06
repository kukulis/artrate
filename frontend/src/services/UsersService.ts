import apiClient from './api'
import type { User } from '../types/user'

/**
 * Service for User-related API calls
 */
class UsersService {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/current-user')
    return response.data
  }
}

// Export a singleton instance
export default new UsersService()
