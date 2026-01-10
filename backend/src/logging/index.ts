/**
 * Global logger singleton for the application
 * Import and use throughout the app without needing to pass logger instances
 */

import type { ILogger } from './ILogger';
import { LokiClient } from "./LokiClient";
import { ConsoleLogger } from "./ConsoleLogger";

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
    lokiUrl: string;
    environment: string;
    defaultLabels?: Record<string, string>;
}

/**
 * Create a logger instance based on configuration
 * Falls back to ConsoleLogger if Loki URL is not provided
 */
export function createLogger(config: LoggerConfig): ILogger {
    const url = config.lokiUrl;

    if (!url || url === '') {
        console.log('Loki URL not configured, using ConsoleLogger');
        return new ConsoleLogger({
            app: 'artcorrect-backend',
            environment: config.environment,
            ...config.defaultLabels
        });
    }

    const defaultLabels = {
        app: 'artcorrect-backend',
        environment: config.environment,
        ...config.defaultLabels
    };

    return new LokiClient({url, defaultLabels});
}

/**
 * Global logger instance
 * Initialized via initLogger()
 */
let _logger: ILogger | null = null;

/**
 * Initialize the global logger
 * Must be called before using getLogger()
 */
export function initLogger(config: LoggerConfig): ILogger {
    if (_logger) {
        console.log('Logger already initialized');
        return _logger;
    }

    _logger = createLogger(config);
    console.log('Logger initialized successfully');
    return _logger;
}

/**
 * Get the global logger instance
 * Throws error if logger not initialized
 *
 * @example
 * import { getLogger } from './logging';
 *
 * const logger = getLogger();
 * logger.info('User logged in', { userId: user.id });
 * logger.error('Failed to process order', { orderId: order.id });
 */

export function getLogger(): ILogger {
    if (!_logger) {
        // throw new Error('Logger not initialized. Call initLogger() first.');
        return new ConsoleLogger({
            app: 'artcorrect-backend',
            environment: 'badtest',
        }, true);
    }
    return _logger;
}

export function wrapError (error :unknown ) {
    return {error: error instanceof Error ? error.message : 'Unknown error'}
}

/**
 * Re-export types and classes for when you need them
 */
export { ILogger } from './ILogger';
export { LokiClient, LokiLogEntry } from './LokiClient';
export { ConsoleLogger, createConsoleLogger } from './ConsoleLogger';
