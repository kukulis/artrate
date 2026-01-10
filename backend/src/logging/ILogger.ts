/**
 * Logger interface - defines the contract for all logger implementations
 */
export interface ILogger {
    /**
     * Log a debug message
     * @param message - The message to log
     * @param labels - Optional key-value pairs for additional context
     */
    debug(message: string, labels?: Record<string, string>): void;

    /**
     * Log an info message
     * @param message - The message to log
     * @param labels - Optional key-value pairs for additional context
     */
    info(message: string, labels?: Record<string, string>): void;

    /**
     * Log a warning message
     * @param message - The message to log
     * @param labels - Optional key-value pairs for additional context
     */
    warn(message: string, labels?: Record<string, string>): void;

    /**
     * Log an error message
     * @param message - The message to log
     * @param labels - Optional key-value pairs for additional context
     */
    error(message: string, labels?: Record<string, string>): void;
}
