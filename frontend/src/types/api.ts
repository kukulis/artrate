/**
 * API Request/Response type definitions
 *
 * These interfaces mirror backend DTOs and provide type safety for API operations.
 * When backend schemas change, update these types accordingly.
 */

// =============================================================================
// Article Types
// =============================================================================

export interface CreateArticleRequest {
    title: string
    author_id: string
    content: string
}

export interface UpdateArticleRequest {
    title?: string
    author_id?: string
    content?: string
}

export interface ArticleResponse {
    id: string
    title: string
    author_id: string
    content: string
    user_id: number
    created_at: string
    updated_at: string
}

// =============================================================================
// Author Types
// =============================================================================

export interface CreateAuthorRequest {
    name: string
    description: string
}

export interface UpdateAuthorRequest {
    name?: string
    description?: string
}

export interface AuthorResponse {
    id: string
    name: string
    description: string
    created_at: string
    updated_at: string
}

// =============================================================================
// Ranking Types
// =============================================================================

export interface CreateRankingRequest {
    ranking_type: string
    helper_type: string
    user_id: number
    article_id: string
    value: number
    description: string
}

export interface UpdateRankingRequest {
    ranking_type: string
    helper_type: string
    user_id: number
    article_id: string
    value: number
    description: string
}

export interface RankingResponse {
    id: string
    ranking_type: string
    helper_type: string
    user_id: number
    article_id: string
    value: number
    description: string
    created_at: string
    updated_at: string
}

export interface RankingFilterParams {
    user_id?: string
    article_id?: string
    ranking_type?: string
    ranking_helper?: string
}

export interface RankingUpsertResponse {
    message: string
    count: number
}

export interface RankingTypeResponse {
    code: string
    description: string
}

export interface RankingHelperResponse {
    code: string
    description: string
}

// =============================================================================
// User Types
// =============================================================================

export interface UserResponse {
    id: number
    email: string
    name: string
    role: 'user' | 'admin' | 'super_admin'
}

// =============================================================================
// Authentication Types
// =============================================================================

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    user: UserResponse
    accessToken: string
    refreshToken: string
}

export interface RegisterRequest {
    email: string
    name: string
    password: string
    captchaToken: string
}

export interface RegisterResponse {
    message: string
}

export interface LogoutRequest {
    refreshToken: string
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken: string
}

export interface ConfirmLoginRequest {
    token: string
}

export interface ConfirmLoginResponse {
    message: string
    user?: UserResponse
    accessToken?: string
    refreshToken?: string
}

// =============================================================================
// Password Reset Types
// =============================================================================

export interface PasswordResetRequestRequest {
    email: string
    captchaToken: string
}

export interface PasswordResetRequestResponse {
    message: string
}

export interface PasswordResetConfirmRequest {
    token: string
    newPassword: string
}

export interface PasswordResetConfirmResponse {
    message: string
}

// =============================================================================
// Admin Types
// =============================================================================

/**
 * Safe user response (without sensitive fields like password_hash)
 */
export interface SafeUserResponse {
    id: number
    email: string
    name: string
    is_active: boolean
    role: 'user' | 'admin' | 'super_admin'
    last_login_at: string | null
    created_at: string
    updated_at: string
}

export interface GetUsersResponse {
    users: SafeUserResponse[]
}

export interface GetUserByIdResponse {
    user: SafeUserResponse
}

export interface UserDisableResponse {
    message: string
    user: SafeUserResponse
}

export interface UserEnableResponse {
    message: string
    user: SafeUserResponse
}

export interface EvaluateRankingRequest {
    articleId: string
    helperType: string
}

export interface EvaluateRankingResponse {
    articleId: string
    helperType: string
    status: 'pending' | 'completed' | 'failed'
    message: string
    article: {
        id: string
        title: string
    }
}

// =============================================================================
// Generic API Types
// =============================================================================

export interface ApiErrorResponse {
    error: string
    message?: string
    details?: Array<{ field: string; message: string }>
}

export interface ApiMessageResponse {
    message: string
}
