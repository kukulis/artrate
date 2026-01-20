import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { server } from '../../test/mocks/server'
import { http, HttpResponse } from 'msw'
import Authors from '../Authors.vue'

const BASE_URL = 'http://localhost:5173'

/**
 * Create a router instance for testing
 */
const createTestRouter = () => {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: '/authors',
                name: 'authors',
                component: Authors
            }
        ]
    })

    router.push('/authors')

    return router
}

describe('Authors', () => {
    beforeEach(() => {
        localStorage.clear()

        // Default handler for getting authors (empty list)
        server.use(
            http.get(`${BASE_URL}/api/authors`, () => {
                return HttpResponse.json([])
            })
        )
    })

    describe('rate limiting', () => {
        it('should display error message when 429 response is received on create', async () => {
            // Set up logged-in user
            localStorage.setItem('user', JSON.stringify({
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                role: 'user'
            }))

            // Mock 429 rate limit response for author creation
            server.use(
                http.post(`${BASE_URL}/api/authors`, () => {
                    return HttpResponse.json(
                        { error: 'Too many authors created. Maximum 5 authors per 24 hours.' },
                        { status: 429 }
                    )
                })
            )

            const router = createTestRouter()
            await router.isReady()

            const wrapper = mount(Authors, {
                global: {
                    plugins: [router]
                }
            })

            await flushPromises()

            // Open create form
            const newAuthorButton = wrapper.find('button.btn-primary')
            expect(newAuthorButton.exists()).toBe(true)
            await newAuthorButton.trigger('click')
            await flushPromises()

            // Fill form
            await wrapper.find('#name').setValue('New Author')
            await wrapper.find('#description').setValue('Author description')

            // Submit form
            await wrapper.find('form').trigger('submit')
            await flushPromises()

            // Check that error message is displayed in the form
            const formError = wrapper.find('.form-error')
            expect(formError.exists()).toBe(true)
            expect(formError.text()).toContain('Too many authors created. Maximum 5 authors per 24 hours.')
        })
    })
})
