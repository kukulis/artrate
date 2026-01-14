import { describe, it, expect, beforeEach, vi } from 'vitest'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import ArticleService from '../ArticleService'
import authHandler from '../AuthenticationHandler'

describe('API Token Refresh Interceptor', () => {
    beforeEach(() => {
        localStorage.clear()
        // Reset window.location.href for each test
        window.location.href = 'http://localhost:5173'
    })

    describe('request interceptor', () => {
        it('should attach access token to requests', async () => {
            authHandler.setAccessToken('test-access-token')

            let capturedAuthHeader: string | null = null

            // Override handler to capture the Authorization header
            server.use(
                http.get('/api/articles', ({ request }) => {
                    capturedAuthHeader = request.headers.get('Authorization')

                    return HttpResponse.json([])
                })
            )

            await ArticleService.getAll()

            expect(capturedAuthHeader).toBe('Bearer test-access-token')
        })

        it('should not attach token if none exists', async () => {
            // No token set
            let capturedAuthHeader: string | null = null

            server.use(
                http.get('/api/articles', ({ request }) => {
                    capturedAuthHeader = request.headers.get('Authorization')

                    return HttpResponse.json([])
                })
            )

            await ArticleService.getAll()

            expect(capturedAuthHeader).toBeNull()
        })
    })

    describe('token refresh on 401', () => {
        it('should refresh token when request returns 401', async () => {
            authHandler.setAccessToken('expired-token')
            authHandler.setRefreshToken('mock-refresh-token')

            let requestCount = 0

            server.use(
                http.get('/api/articles', ({ request }) => {
                    requestCount++
                    const auth = request.headers.get('Authorization')

                    // First request with expired token fails
                    if (auth === 'Bearer expired-token') {
                        return HttpResponse.json(
                            { error: 'Token expired' },
                            { status: 401 }
                        )
                    }

                    // Second request with new token succeeds
                    return HttpResponse.json([
                        { id: '1', title: 'Test Article' }
                    ])
                })
            )

            const articles = await ArticleService.getAll()

            // Verify request was retried (called twice)
            expect(requestCount).toBe(2)

            // Verify new token was stored
            expect(authHandler.getAccessToken()).toBe('new-mock-access-token')
            expect(authHandler.getRefreshToken()).toBe('new-mock-refresh-token')

            // Verify data was returned successfully
            expect(articles).toHaveLength(1)
            expect(articles[0].title).toBe('Test Article')
        })

        it('should only refresh token once for multiple simultaneous 401s', async () => {
            authHandler.setAccessToken('expired-token')
            authHandler.setRefreshToken('mock-refresh-token')

            let refreshCallCount = 0

            server.use(
                http.post('/api/auth/refresh', () => {
                    refreshCallCount++

                    return HttpResponse.json({
                        user: { id: 1, email: 'test@example.com' },
                        accessToken: 'new-token',
                        refreshToken: 'new-refresh'
                    })
                }),
                http.get('/api/articles', ({ request }) => {
                    const auth = request.headers.get('Authorization')

                    if (auth === 'Bearer expired-token') {
                        return HttpResponse.json(
                            { error: 'Token expired' },
                            { status: 401 }
                        )
                    }

                    return HttpResponse.json([{ id: '1' }])
                })
            )

            // Make 3 simultaneous requests
            const [articles1, articles2, articles3] = await Promise.all([
                ArticleService.getAll(),
                ArticleService.getAll(),
                ArticleService.getAll()
            ])

            // Verify refresh was only called once (not 3 times)
            expect(refreshCallCount).toBe(1)

            // Verify all requests succeeded
            expect(articles1).toHaveLength(1)
            expect(articles2).toHaveLength(1)
            expect(articles3).toHaveLength(1)
        })

        it('should update user data after token refresh', async () => {
            authHandler.setAccessToken('expired-token')
            authHandler.setRefreshToken('mock-refresh-token')
            authHandler.setUser({ id: 1, email: 'old@example.com' })

            server.use(
                http.get('/api/articles', ({ request }) => {
                    const auth = request.headers.get('Authorization')

                    if (auth === 'Bearer expired-token') {
                        return HttpResponse.json(
                            { error: 'Token expired' },
                            { status: 401 }
                        )
                    }

                    return HttpResponse.json([])
                })
            )

            await ArticleService.getAll()

            // Verify user data was updated
            const user = authHandler.getUser()
            expect(user.email).toBe('test@example.com')
        })
    })

    describe('logout on refresh failure', () => {
        it('should clear tokens and redirect when refresh token is invalid', async () => {
            authHandler.setAccessToken('expired-token')
            authHandler.setRefreshToken('invalid-refresh-token')

            server.use(
                http.get('/api/articles', () => {
                    return HttpResponse.json(
                        { error: 'Unauthorized' },
                        { status: 401 }
                    )
                }),
                http.post('/api/auth/refresh', () => {
                    return HttpResponse.json(
                        { error: 'Invalid or expired refresh token' },
                        { status: 401 }
                    )
                })
            )

            // Attempt request
            try {
                await ArticleService.getAll()
            } catch (error) {
                // Expected to fail
            }

            // Verify tokens were cleared
            expect(authHandler.getAccessToken()).toBeNull()
            expect(authHandler.getRefreshToken()).toBeNull()
            expect(authHandler.getUser()).toBeNull()

            // Verify redirect to login
            expect(window.location.href).toContain('/login')
        })

        it('should logout and redirect if refresh endpoint returns 401', async () => {
            authHandler.setAccessToken('expired-token')
            authHandler.setRefreshToken('expired-refresh-token')

            server.use(
                http.get('/api/articles', () => {
                    return HttpResponse.json(
                        { error: 'Token expired' },
                        { status: 401 }
                    )
                }),
                http.post('/api/auth/refresh', () => {
                    return HttpResponse.json(
                        { error: 'Refresh token expired' },
                        { status: 401 }
                    )
                })
            )

            // Try to get articles - this will trigger refresh attempt which fails
            try {
                await ArticleService.getAll()
            } catch (error) {
                // Expected to fail
            }

            // Verify tokens were cleared and redirected
            expect(window.location.href).toContain('/login')
        })

        it('should logout when no refresh token is available', async () => {
            authHandler.setAccessToken('expired-token')
            // No refresh token set

            server.use(
                http.get('/api/articles', () => {
                    return HttpResponse.json(
                        { error: 'Token expired' },
                        { status: 401 }
                    )
                })
            )

            try {
                await ArticleService.getAll()
            } catch (error) {
                // Expected to fail
            }

            // Verify redirected to login
            expect(window.location.href).toContain('/login')
        })
    })

    describe('non-401 errors', () => {
        it('should not trigger refresh for other error codes', async () => {
            authHandler.setAccessToken('valid-token')
            authHandler.setRefreshToken('valid-refresh')

            let refreshCalled = false

            server.use(
                http.get('/api/articles', () => {
                    return HttpResponse.json(
                        { error: 'Server error' },
                        { status: 500 }
                    )
                }),
                http.post('/api/auth/refresh', () => {
                    refreshCalled = true

                    return HttpResponse.json({})
                })
            )

            try {
                await ArticleService.getAll()
            } catch (error) {
                // Expected to fail with 500
            }

            // Verify refresh was NOT called
            expect(refreshCalled).toBe(false)

            // Verify tokens unchanged
            expect(authHandler.getAccessToken()).toBe('valid-token')
        })

        it('should pass through 404 errors without refresh', async () => {
            authHandler.setAccessToken('valid-token')

            server.use(
                http.get('/api/articles/999', () => {
                    return HttpResponse.json(
                        { error: 'Not found' },
                        { status: 404 }
                    )
                })
            )

            await expect(ArticleService.getById('999')).rejects.toThrow()

            // Token should remain unchanged
            expect(authHandler.getAccessToken()).toBe('valid-token')
        })
    })
})
