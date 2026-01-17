import apiClient from './api'
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    LogoutRequest,
    ConfirmLoginResponse,
    UserResponse
} from '../types/api'

class AuthenticationHandler {
    async login(email: string, password: string): Promise<UserResponse> {
        const request: LoginRequest = { email, password }
        const response = await apiClient.post<LoginResponse>('/auth/login', request)

        this.postLoginActions(response.data)

        return response.data.user
    }

    async logout(): Promise<void> {
        // Save refreshToken for the API call before clearing
        const refreshToken = this.getRefreshToken()

        // Clear ALL auth data FIRST (before any API calls)
        // This prevents the interceptor from restoring the session on 401
        this.setAccessToken(null)
        this.setUser(null)
        this.setRefreshToken(null)

        try {
            if (refreshToken) {
                const request: LogoutRequest = { refreshToken }
                await apiClient.post('/auth/logout', request)
            }
        } catch (error) {
            // Ignore logout errors - local state is already cleared
            console.warn('Logout API call failed', error)
        }
    }

    async register(email: string, name: string, password: string, captchaToken: string): Promise<RegisterResponse> {
        const request: RegisterRequest = { email, name, password, captchaToken }
        const response = await apiClient.post<RegisterResponse>('/auth/register', request)

        return response.data
    }

    async confirmLogin(token: string): Promise<ConfirmLoginResponse> {
        const response = await apiClient.get<ConfirmLoginResponse>('/auth/confirm?token=' + token)

        return response.data
    }

    postLoginActions(data: LoginResponse): void {
        if (data.user) {
            this.setUser(data.user)
        }

        if (!data.accessToken || !data.refreshToken) {
            throw new Error('the login response does not contain refresh or access token')
        }
        this.setAccessToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)
    }

    setAccessToken(accessToken: string | null): void {
        if (accessToken == null) {
            localStorage.removeItem('accessToken')

            return
        }
        localStorage.setItem('accessToken', accessToken)
    }

    setRefreshToken(refreshToken: string | null): void {
        if (refreshToken == null) {
            localStorage.removeItem('refreshToken')

            return
        }
        localStorage.setItem('refreshToken', refreshToken)
    }

    setUser(user: UserResponse | null): void {
        if (user == null) {
            localStorage.removeItem('user')

            return
        }
        localStorage.setItem('user', JSON.stringify(user))
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken')
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken')
    }

    getUser(): UserResponse | null {
        const userStr = localStorage.getItem('user')
        if (userStr == null) {
            return null;
        }
        try {
            return JSON.parse(userStr) as UserResponse
        } catch (error) {
            console.log('error parsing user str', error)

            return null
        }
    }
}

export default new AuthenticationHandler()