/**
 * Global logger singleton for the application
 * Import and use throughout the app without needing to pass logger instances
 */

import { ILogger } from './ILogger';
import { createLokiClient } from './LokiClient';

/**
 * Global logger instance
 * Use this in your routes, services, and middleware
 *
 * @example
 * import { logger } from './logging';
 *
 * logger.info('User logged in', { userId: user.id });
 * logger.error('Failed to process order', { orderId: order.id });
 */
export const logger = createLokiClient({url: process.env.LOKI_URL});

export function wrapError (error :unknown ) {
    return {error: error instanceof Error ? error.message : 'Unknown error'}
}

/**
 * Re-export types and classes for when you need them
 */
export { ILogger } from './ILogger';
export { LokiClient, LokiLogEntry, LokiClientConfig, createLokiClient } from './LokiClient';
export { ConsoleLogger, createConsoleLogger } from './ConsoleLogger';

/**
 * Factory for creating service-specific loggers with custom labels
 * Use this when you need a logger with specific context
 *
 * @example
 * const orderLogger = createServiceLogger('OrderService');
 * orderLogger.info('Order created');  // Automatically includes service: 'OrderService' label
 */
export function createServiceLogger(serviceName: string): ILogger {
    return createLokiClient({
        defaultLabels: { service: serviceName }
    });
}
