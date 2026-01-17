import apiClient from './api'
import type {
    SafeUserResponse,
    GetUsersResponse,
    GetUserByIdResponse,
    UserDisableResponse,
    UserEnableResponse,
    UpdateUserRoleRequest,
    UpdateUserRoleResponse,
    EvaluateRankingRequest,
    EvaluateRankingResponse
} from '../types/api'

/**
 * Service for Admin-related API calls
 * All endpoints require authentication and admin role
 */
class AdminService {
    /**
     * Get all users
     */
    async getUsers(): Promise<SafeUserResponse[]> {
        const response = await apiClient.get<GetUsersResponse>('/auth/admin/users')

        return response.data.users
    }

    /**
     * Get a single user by ID
     */
    async getUserById(id: number): Promise<SafeUserResponse> {
        const response = await apiClient.get<GetUserByIdResponse>(`/auth/admin/users/${id}`)

        return response.data.user
    }

    /**
     * Disable a user account
     */
    async disableUser(id: number): Promise<UserDisableResponse> {
        const response = await apiClient.patch<UserDisableResponse>(`/auth/admin/users/${id}/disable`)

        return response.data
    }

    /**
     * Enable a user account
     */
    async enableUser(id: number): Promise<UserEnableResponse> {
        const response = await apiClient.patch<UserEnableResponse>(`/auth/admin/users/${id}/enable`)

        return response.data
    }

    /**
     * Update a user's role
     */
    async updateUserRole(id: number, role: 'user' | 'admin'): Promise<UpdateUserRoleResponse> {
        const request: UpdateUserRoleRequest = { role }
        const response = await apiClient.patch<UpdateUserRoleResponse>(`/auth/admin/users/${id}/role`, request)

        return response.data
    }

    /**
     * Execute AI ranking evaluation for an article
     */
    async evaluateRanking(request: EvaluateRankingRequest): Promise<EvaluateRankingResponse> {
        const response = await apiClient.post<EvaluateRankingResponse>(
            '/auth/admin/rankings/evaluate',
            request
        )

        return response.data
    }
}

// Export a singleton instance
export default new AdminService()
