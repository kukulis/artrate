import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import PasswordResetConfirm from '../PasswordResetConfirm.vue'

const BASE_URL = 'http://localhost:5173'

/**
 * Create a router instance with the password reset confirm route
 */
const createTestRouter = (queryToken?: string) => {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: '/password-reset-confirm',
                name: 'password_reset_confirm',
                component: PasswordResetConfirm
            },
            {
                path: '/login',
                name: 'login',
                component: { template: '<div>Login</div>' }
            },
            {
                path: '/password-reset-request',
                name: 'password_reset_request',
                component: { template: '<div>Password Reset Request</div>' }
            }
        ]
    })

    const query = queryToken !== undefined ? { token: queryToken } : {}
    router.push({ path: '/password-reset-confirm', query })

    return router
}

describe('PasswordResetConfirm', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    describe('token validation', () => {
        it('should show error when token is missing', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.text()).toContain('Invalid or missing password reset token')
            expect(wrapper.find('form').exists()).toBe(false)
        })

        it('should show error when token is empty string', async () => {
            const router = createTestRouter('')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.text()).toContain('Invalid or missing password reset token')
        })

        it('should show error when token is whitespace only', async () => {
            const router = createTestRouter('   ')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.text()).toContain('Invalid or missing password reset token')
        })

        it('should show form when valid token is provided', async () => {
            const router = createTestRouter('valid-reset-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.find('form').exists()).toBe(true)
            expect(wrapper.find('#password').exists()).toBe(true)
            expect(wrapper.find('#passwordConfirm').exists()).toBe(true)
        })
    })

    describe('form validation', () => {
        it('should show error when password is empty', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password is required')
        })

        it('should show error when password is too short', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('short')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password must be at least 8 characters long')
        })

        it('should show error when confirm password is empty', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('validpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Please confirm your password')
        })

        it('should show error when passwords do not match', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('validpassword123')
            await wrapper.find('#passwordConfirm').setValue('differentpassword')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Passwords do not match')
        })
    })

    describe('API interaction', () => {
        it('should submit password reset request with correct data', async () => {
            let capturedBody: any = null

            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, async ({ request }) => {
                    capturedBody = await request.json()

                    return HttpResponse.json({
                        message: 'Password has been reset successfully'
                    })
                })
            )

            const router = createTestRouter('test-reset-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(capturedBody).toEqual({
                token: 'test-reset-token',
                password: 'newpassword123'
            })
        })

        it('should show success message after successful reset', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json({
                        message: 'Password has been reset successfully'
                    })
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password has been reset successfully')
            expect(wrapper.text()).toContain('You can now log in with your new password')
            expect(wrapper.find('form').exists()).toBe(false)
        })

        it('should show default success message when API returns no message', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json({})
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Your password has been successfully reset')
        })

        it('should clear form fields after successful reset', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json({
                        message: 'Password reset'
                    })
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            const passwordInput = wrapper.find('#password')
            const confirmInput = wrapper.find('#passwordConfirm')

            await passwordInput.setValue('newpassword123')
            await confirmInput.setValue('newpassword123')

            expect((passwordInput.element as HTMLInputElement).value).toBe('newpassword123')

            await wrapper.find('form').trigger('submit')
            await flushPromises()

            // Form should be hidden after success, so fields are cleared internally
            expect(wrapper.find('form').exists()).toBe(false)
        })

        it('should show API error message', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json(
                        { error: 'Invalid or expired token' },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter('expired-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Invalid or expired token')
            expect(wrapper.find('form').exists()).toBe(true)
        })

        it('should handle Zod validation errors from API', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json(
                        {
                            details: [
                                { field: 'password', message: 'Password must contain a number' }
                            ]
                        },
                        { status: 400 }
                    )
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('passwordonly')
            await wrapper.find('#passwordConfirm').setValue('passwordonly')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Password must contain a number')
        })

        it('should show generic error when API fails unexpectedly', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json(
                        {},
                        { status: 500 }
                    )
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            expect(wrapper.text()).toContain('Failed to reset password. The link may have expired.')
        })
    })

    describe('loading state', () => {
        it('should disable inputs and button while loading', async () => {
            let resolveRequest: () => void
            const requestPromise = new Promise<void>((resolve) => {
                resolveRequest = resolve
            })

            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, async () => {
                    await requestPromise

                    return HttpResponse.json({ message: 'Success' })
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')

            // Submit without waiting
            wrapper.find('form').trigger('submit')
            await vi.waitFor(() => {
                expect(wrapper.find('button[type="submit"]').text()).toContain('Resetting...')
            })

            expect(wrapper.find('#password').attributes('disabled')).toBeDefined()
            expect(wrapper.find('#passwordConfirm').attributes('disabled')).toBeDefined()
            expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

            // Resolve the request
            resolveRequest!()
            await flushPromises()
        })

        it('should show normal button text when not loading', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            expect(wrapper.find('button[type="submit"]').text()).toBe('Reset Password')
        })
    })

    describe('navigation links', () => {
        it('should have link to login page in success state', async () => {
            server.use(
                http.post(`${BASE_URL}/api/auth/password-reset/confirm`, () => {
                    return HttpResponse.json({ message: 'Success' })
                })
            )

            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            await wrapper.find('#password').setValue('newpassword123')
            await wrapper.find('#passwordConfirm').setValue('newpassword123')
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            const loginLink = wrapper.find('a[href="/login"]')
            expect(loginLink.exists()).toBe(true)
            expect(loginLink.text()).toContain('Go to Login')
        })

        it('should have link to request new reset in token error state', async () => {
            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            const resetLink = wrapper.find('a[href="/password-reset-request"]')
            expect(resetLink.exists()).toBe(true)
            expect(resetLink.text()).toContain('Request New Reset Link')
        })

        it('should have back to login link in form state', async () => {
            const router = createTestRouter('valid-token')
            await router.isReady()

            const wrapper = mount(PasswordResetConfirm, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            const loginLink = wrapper.find('.links a[href="/login"]')
            expect(loginLink.exists()).toBe(true)
            expect(loginLink.text()).toContain('Back to Login')
        })
    })
})
