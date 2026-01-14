import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:5173'

/**
 * Mock API handlers for testing
 * These intercept HTTP requests and return mock responses
 */
export const handlers = [
    // Login endpoint
    http.post(`${BASE_URL}/api/auth/login`, async ({ request }) => {
        const body = await request.json() as { email: string; password: string }

        if (body.email === 'test@example.com' && body.password === 'password123') {
            return HttpResponse.json({
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'user',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            })
        }

        return HttpResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
        )
    }),

    // Refresh token endpoint
    http.post(`${BASE_URL}/api/auth/refresh`, async ({ request }) => {
        const body = await request.json() as { refreshToken: string }

        if (body.refreshToken === 'mock-refresh-token') {
            return HttpResponse.json({
                user: {
                    id: 1,
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'user',
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                accessToken: 'new-mock-access-token',
                refreshToken: 'new-mock-refresh-token'
            })
        }

        return HttpResponse.json(
            { error: 'Invalid or expired refresh token' },
            { status: 401 }
        )
    }),

    // Logout endpoint
    http.post(`${BASE_URL}/api/auth/logout`, () => {
        return new HttpResponse(null, { status: 204 })
    }),

    // Register endpoint - match both absolute and relative URLs
    http.post('*/api/auth/register', async ({ request }) => {
        const body = await request.json() as { email: string; name: string; password: string; captchaToken: string }

        if (body.email === 'existing@example.com') {
            return HttpResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        return HttpResponse.json(
            {
                user: {
                    email: body.email
                }
            },
            { status: 201 }
        )
    }),

    // Article endpoints (for interceptor testing)
    http.get(`${BASE_URL}/api/articles`, ({ request }) => {
        const authHeader = request.headers.get('Authorization')

        if (!authHeader || authHeader === 'Bearer expired-token') {
            return HttpResponse.json(
                { error: 'Token expired' },
                { status: 401 }
            )
        }

        return HttpResponse.json([
            {
                id: '1',
                title: 'Test Article',
                author_id: '1',
                user_id: '1',
                content: 'Test content',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ])
    }),

    http.post(`${BASE_URL}/api/articles`, ({ request }) => {
        const authHeader = request.headers.get('Authorization')

        if (!authHeader || authHeader === 'Bearer expired-token') {
            return HttpResponse.json(
                { error: 'Token expired' },
                { status: 401 }
            )
        }

        return HttpResponse.json(
            {
                id: '2',
                title: 'New Article',
                author_id: '1',
                user_id: '1',
                content: 'New content',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            { status: 201 }
        )
    }),

    http.get(`${BASE_URL}/api/articles/:id`, ({ params }) => {
        const { id } = params

        if (id === '999') {
            return HttpResponse.json(
                { error: 'Not found' },
                { status: 404 }
            )
        }

        return HttpResponse.json({
            id: id as string,
            title: 'Article ' + id,
            author_id: '1',
            user_id: '1',
            content: 'Content',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    })
]
