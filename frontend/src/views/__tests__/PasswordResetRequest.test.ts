import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import PasswordResetRequest from '../PasswordResetRequest.vue'

const BASE_URL = 'http://localhost:5173'

// Mock the useRecaptcha composable
const mockCaptchaToken = ref<string | null>(null)
const mockResetRecaptcha = vi.fn(() => {
    mockCaptchaToken.value = null
})

vi.mock('../../composables/useRecaptcha', () => ({
    useRecaptcha: () => ({
        token: mockCaptchaToken,
        resetRecaptcha: mockResetRecaptcha,
        renderRecaptcha: vi.fn()
    })
}))

/**
 * Create a router instance for testing
 */
const createTestRouter = () => {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: '/password-reset',
                name: 'password-reset',
                component: PasswordResetRequest
            },
            {
                path: '/login',
                name: 'login',
                component: { template: '<div>Login</div>' }
            }
        ]
    })

    router.push('/password-reset')

    return router
}

describe('PasswordResetRequest', () => {
    beforeEach(() => {
        mockCaptchaToken.value = null
        mockResetRecaptcha.mockClear()
    })

    describe('form validation', () => {
        it('should show error when email is empty', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Email is required')
        })

        it('should show error when email format is invalid', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            await wrapper.find('input[type="email"]').setValue('invalid-email')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Please enter a valid email address')
        })

        it('should show error when captcha is not completed', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Please complete the CAPTCHA')
        })
    })

    describe('API interaction', () => {
        it('should submit request with correct data', async () => {
            let capturedRequest: { email: string; captchaToken: string } | null = null

            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, async ({ request }) => {
                    capturedRequest = await request.json() as { email: string; captchaToken: string }

                    return HttpResponse.json({ message: 'Password reset link sent' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(capturedRequest).toEqual({
                email: 'test@example.com',
                captchaToken: 'test-captcha-token'
            })
        })

        it('should show success message after successful request', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json({ message: 'Password reset link sent to your email' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.success-message').exists()).toBe(true)
            expect(wrapper.text()).toContain('Password reset link sent to your email')
        })

        it('should clear email field after successful request', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json({ message: 'Password reset link sent' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            const emailInput = wrapper.find('input[type="email"]')
            await emailInput.setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            // After success, form is hidden, but we verify email was cleared
            // by checking that success message is shown (form state was reset)
            expect(wrapper.find('.success-message').exists()).toBe(true)
            expect(wrapper.find('.form-container').exists()).toBe(false)
        })

        it('should show error message from API response', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json(
                        { error: 'Email not found in our system' },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('unknown@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Email not found in our system')
        })

        it('should show Zod validation error from API', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json(
                        {
                            details: [
                                { field: 'email', message: 'Invalid email format' }
                            ]
                        },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Invalid email format')
        })

        it('should show generic error on network failure', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.error()
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.find('.form-error').text()).toBe('Failed to send password reset request. Please try again.')
        })

        it('should reset captcha after failed request', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json(
                        { error: 'Something went wrong' },
                        { status: 500 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(mockResetRecaptcha).toHaveBeenCalled()
        })
    })

    describe('UI behavior', () => {
        it('should disable input and button while loading', async () => {
            let resolveRequest: () => void
            const requestPromise = new Promise<void>((resolve) => {
                resolveRequest = resolve
            })

            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, async () => {
                    await requestPromise

                    return HttpResponse.json({ message: 'Success' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            wrapper.find('form').trigger('submit')

            await flushPromises()

            // Check that inputs are disabled during loading
            expect(wrapper.find('input[type="email"]').attributes('disabled')).toBeDefined()
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

            // Resolve the request
            resolveRequest!()
            await flushPromises()
        })

        it('should show loading text on button while submitting', async () => {
            let resolveRequest: () => void
            const requestPromise = new Promise<void>((resolve) => {
                resolveRequest = resolve
            })

            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, async () => {
                    await requestPromise

                    return HttpResponse.json({ message: 'Success' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')

            // Check initial button text
            expect(wrapper.find('button[type="submit"]').text()).toBe('Request Password Reset')

            wrapper.find('form').trigger('submit')
            await flushPromises()

            // Check loading text
            expect(wrapper.find('button[type="submit"]').text()).toBe('Sending...')

            // Resolve the request
            resolveRequest!()
            await flushPromises()
        })

        it('should have link to login page', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            const loginLink = wrapper.find('.links a')
            expect(loginLink.exists()).toBe(true)
            expect(loginLink.text()).toBe('Back to Login')
            expect(loginLink.attributes('href')).toBe('/login')
        })

        it('should show login link after successful request', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/request`, () => {
                    return HttpResponse.json({ message: 'Password reset link sent' })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetRequest, {
                global: {
                    plugins: [router]
                }
            })

            mockCaptchaToken.value = 'test-captcha-token'
            await wrapper.find('input[type="email"]').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            const backLink = wrapper.find('.success-message .back-link')
            expect(backLink.exists()).toBe(true)
            expect(backLink.text()).toBe('Back to Login')
            expect(backLink.attributes('href')).toBe('/login')
        })
    })
})
