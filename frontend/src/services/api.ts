import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import authHandler from './AuthenticationHandler'

/**
 * Base API client configuration
 * All requests will be prefixed with /api and proxied to backend
 */
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
})

// Track if a token refresh is in progress
let isRefreshing = false

// Queue of failed requests waiting for token refresh
interface QueueItem {
    resolve: (token: string) => void
    reject: (error: any) => void
}
let failedQueue: QueueItem[] = []

/**
 * Process all queued requests after token refresh completes
 */
const processQueue = (error: any = null, token: string | null = null): void => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error)
        } else if (token) {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

/**
 * Request interceptor - Attach access token to all requests
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = authHandler.getAccessToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * Response interceptor - Handle token refresh on 401 errors
 */
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Only handle 401 errors (token expired/invalid)
        if (error.response?.status !== 401) {
            return Promise.reject(error)
        }

        // Don't intercept auth endpoints - let them handle their own errors
        const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint))
        if (isAuthEndpoint) {
            return Promise.reject(error)
        }

        // Don't retry if we already tried once
        if (originalRequest._retry) {
            await authHandler.logout()
            window.location.href = '/login'

            return Promise.reject(error)
        }

        // If another request is already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`
                        }
                        resolve(apiClient(originalRequest))
                    },
                    reject
                })
            })
        }

        // Mark this request as retried
        originalRequest._retry = true
        isRefreshing = true

        try {
            // Get refresh token from storage
            const refreshToken = authHandler.getRefreshToken()
            if (!refreshToken) {
                throw new Error('No refresh token available')
            }

            // Call backend to refresh the access token
            const response = await axios.post('/api/auth/refresh', { refreshToken })
            const { accessToken, refreshToken: newRefreshToken, user } = response.data

            // Update stored tokens and user
            authHandler.setAccessToken(accessToken)
            authHandler.setRefreshToken(newRefreshToken)
            authHandler.setUser(user)

            // Update Authorization header for the original failed request
            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }

            // Process all queued requests with the new token
            processQueue(null, accessToken)

            // Retry the original request with the new token
            return apiClient(originalRequest)

        } catch (refreshError) {
            // Token refresh failed - clear auth data and redirect to login
            processQueue(refreshError, null)
            await authHandler.logout()
            window.location.href = '/login'

            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default apiClient
