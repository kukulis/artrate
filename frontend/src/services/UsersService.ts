import apiClient from './api'
import type { UserResponse } from '../types/api'

/**
 * Service for User-related API calls
 */
class UsersService {
    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>('/current-user')

        return response.data
    }
}

// Export a singleton instance
export default new UsersService()
