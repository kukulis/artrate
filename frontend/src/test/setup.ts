import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'
import apiClient from '../services/api'

/**
 * Setup MSW server for all tests
 * This will intercept HTTP requests and return mocked responses
 */

// Setup base URL for axios in tests
beforeAll(() => {
    // Set up a base URL for the test environment
    Object.defineProperty(window, 'location', {
        value: {
            origin: 'http://localhost:5173',
            href: 'http://localhost:5173',
            protocol: 'http:',
            host: 'localhost:5173',
            hostname: 'localhost',
            port: '5173',
            pathname: '/',
            search: '',
            hash: ''
        },
        writable: true
    })

    // Configure apiClient baseURL for testing
    apiClient.defaults.baseURL = 'http://localhost:5173/api'

    server.listen({ onUnhandledRequest: 'error' })
})

// Reset handlers after each test to prevent test interference
afterEach(() => {
    server.resetHandlers()
    // Clear localStorage after each test
    localStorage.clear()
})

// Clean up after all tests are done
afterAll(() => {
    server.close()
})
