import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Create MSW server instance with default handlers
 * This server will intercept HTTP requests during tests
 */
export const server = setupServer(...handlers)
