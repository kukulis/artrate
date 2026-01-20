import apiClient from './api'
import type { UserResponse } from '../types/api'

/**
 * Service for User-related API calls
 */
class UsersService {
    /**
     * Get the current authenticated user
     */
    async getCurrentUser(): Promise<UserResponse|null> {
        try {
            const response = await apiClient.get<UserResponse>('/current-user')

            return response.data
        } catch (error) {
            if ( error instanceof Error &&  error?.response?.status == 401) {
                return null;
            }
            console.error('error fetching current user', error)
            throw error
        }
    }
}

// Export a singleton instance
export default new UsersService()
