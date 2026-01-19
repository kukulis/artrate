import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import Register from '../Register.vue'

const BASE_URL = 'http://localhost:5173'

// Mock the useRecaptcha composable
const mockCaptchaToken = ref<string | null>(null)
const mockResetCaptcha = vi.fn(() => {
    mockCaptchaToken.value = null
})

vi.mock('../../composables/useRecaptcha', () => ({
    useRecaptcha: () => ({
        token: mockCaptchaToken,
        resetRecaptcha: mockResetCaptcha,
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
                path: '/register',
                name: 'register',
                component: Register
            },
            {
                path: '/login',
                name: 'login',
                component: { template: '<div>Login</div>' }
            },
            {
                path: '/logout',
                name: 'logout',
                component: { template: '<div>Logout</div>' }
            }
        ]
    })

    router.push('/register')

    return router
}

describe('Register', () => {
    beforeEach(() => {
        localStorage.clear()
        mockCaptchaToken.value = null
        mockResetCaptcha.mockClear()
    })

    describe('logged in user', () => {
        it('should show message when user is already logged in', async () => {
            localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Test User' }))

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.text()).toContain('You are already logged in')
            expect(wrapper.text()).toContain('test@example.com')
        })

        it('should not show registration form when logged in', async () => {
            localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Test User' }))

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.find('form').exists()).toBe(false)
        })

        it('should show logout link when logged in', async () => {
            localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Test User' }))

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            const logoutLink = wrapper.find('a[href="/logout"]')
            expect(logoutLink.exists()).toBe(true)
            expect(logoutLink.text()).toContain('Logout')
        })
    })

    describe('form validation', () => {
        it('should show error when email is empty', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Email is required')
        })

        it('should show error when name is empty', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Name is required')
        })

        it('should show error when password is empty', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password is required')
        })

        it('should show error when password is too short', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('short')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password must be at least 8 characters long')
        })

        it('should show error when passwords do not match', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('validpassword123')
            await wrapper.find('#password2').setValue('differentpassword')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Passwords do not match')
        })

        it('should show error when captcha is not completed', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('validpassword123')
            await wrapper.find('#password2').setValue('validpassword123')
            // captchaToken is null by default
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Please complete the CAPTCHA')
        })
    })

    describe('API interaction', () => {
        it('should submit registration with correct data', async () => {
            let capturedBody: any = null

            server.use(
                http.post(`${BASE_URL}/api/auth/register`, async ({ request }) => {
                    capturedBody = await request.json()

                    return HttpResponse.json({
                        user: { email: 'newuser@example.com' }
                    }, { status: 201 })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('newuser@example.com')
            await wrapper.find('#name').setValue('New User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(capturedBody).toEqual({
                email: 'newuser@example.com',
                name: 'New User',
                password: 'securepassword123',
                captchaToken: 'mock-captcha-token'
            })
        })

        it('should show success message after successful registration', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/register`, () => {
                    return HttpResponse.json({
                        user: { email: 'newuser@example.com' }
                    }, { status: 201 })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('newuser@example.com')
            await wrapper.find('#name').setValue('New User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Registration Successful')
            expect(wrapper.text()).toContain('newuser@example.com')
            expect(wrapper.find('form').exists()).toBe(false)
        })

        it('should show error when email already exists', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/register`, () => {
                    return HttpResponse.json(
                        { error: 'User with this email already exists' },
                        { status: 409 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('existing@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('User with this email already exists')
            expect(wrapper.find('form').exists()).toBe(true)
        })

        it('should show field-specific validation errors from API', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/register`, () => {
                    return HttpResponse.json(
                        {
                            error: 'Validation failed',
                            details: [
                                { field: 'email', message: 'Email format is invalid' },
                                { field: 'password', message: 'Password must contain a number' },
                                { field: 'name', message: 'Name is too short' }
                            ]
                        },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('invalid')
            await wrapper.find('#name').setValue('A')
            await wrapper.find('#password1').setValue('nodigits')
            await wrapper.find('#password2').setValue('nodigits')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Email format is invalid')
            expect(wrapper.text()).toContain('Password must contain a number')
            expect(wrapper.text()).toContain('Name is too short')
        })

        it('should reset captcha after failed registration', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/register`, () => {
                    return HttpResponse.json(
                        { error: 'Registration failed' },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(mockResetCaptcha).toHaveBeenCalled()
        })
    })

    describe('loading state', () => {
        it('should disable inputs and button while loading', async () => {
            let resolveRequest: () => void
            const requestPromise = new Promise<void>((resolve) => {
                resolveRequest = resolve
            })

            server.use(
                http.post(`${BASE_URL}/api/auth/register`, async () => {
                    await requestPromise

                    return HttpResponse.json({
                        user: { email: 'test@example.com' }
                    }, { status: 201 })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'

            // Submit without waiting
            wrapper.find('form').trigger('submit')
            await vi.waitFor(() => {
                expect(wrapper.find('button[type="submit"]').text()).toContain('Creating Account...')
            })

            expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
            expect(wrapper.find('#name').attributes('disabled')).toBeDefined()
            expect(wrapper.find('#password1').attributes('disabled')).toBeDefined()
            expect(wrapper.find('#password2').attributes('disabled')).toBeDefined()
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
                http.post(`${BASE_URL}/api/auth/register`, async () => {
                    await requestPromise

                    return HttpResponse.json({
                        user: { email: 'test@example.com' }
                    }, { status: 201 })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            // Before submitting
            expect(wrapper.find('button[type="submit"]').text()).toBe('Create Account')

            await wrapper.find('#email').setValue('test@example.com')
            await wrapper.find('#name').setValue('Test User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'

            // Submit without waiting
            wrapper.find('form').trigger('submit')
            await vi.waitFor(() => {
                expect(wrapper.find('button[type="submit"]').text()).toBe('Creating Account...')
            })

            // Resolve the request
            resolveRequest!()
            await flushPromises()
        })
    })

    describe('navigation links', () => {
        it('should have link to login page', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            const loginLink = wrapper.find('.links a[href="/login"]')
            expect(loginLink.exists()).toBe(true)
            expect(loginLink.text()).toContain('Sign In')
        })

        it('should show login link after successful registration', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/register`, () => {
                    return HttpResponse.json({
                        user: { email: 'newuser@example.com' }
                    }, { status: 201 })
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Register, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#email').setValue('newuser@example.com')
            await wrapper.find('#name').setValue('New User')
            await wrapper.find('#password1').setValue('securepassword123')
            await wrapper.find('#password2').setValue('securepassword123')
            mockCaptchaToken.value = 'mock-captcha-token'
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            const loginLink = wrapper.find('a[href="/login"]')
            expect(loginLink.exists()).toBe(true)
            expect(loginLink.text()).toContain('Go to Login')
        })
    })
})
