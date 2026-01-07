/**
 * Mock logger for integration tests
 * Import this file at the top of your test files to mock the logging module
 *
 * @example
 * import '../test-utils/mockLogger';
 */

jest.mock('../logging', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn()
    },
    wrapError: jest.fn((error: unknown) => ({
        error: error instanceof Error ? error.message : 'Unknown error'
    }))
}));
