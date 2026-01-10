import { ILogger } from './ILogger';

/**
 * Console-based logger implementation
 * Uses console.log and console.error for output
 */
export class ConsoleLogger implements ILogger {
    private defaultLabels: Record<string, string>;
    private silent: boolean

    constructor(defaultLabels?: Record<string, string>, silent : boolean = false ) {
        this.defaultLabels = defaultLabels || {};
        this.silent = silent
    }

    /**
     * Format a log message with timestamp and labels
     */
    private formatMessage(level: string, message: string, labels?: Record<string, string>): string {
        const timestamp = new Date().toISOString();
        const allLabels = { ...this.defaultLabels, ...labels };
        const labelStr = Object.entries(allLabels).length > 0
            ? ' ' + JSON.stringify(allLabels)
            : '';

        return `[${timestamp}] [${level.toUpperCase()}]${labelStr} ${message}`;
    }

    debug(message: string, labels?: Record<string, string>): void {
        if ( this.silent ) return;
        console.log(this.formatMessage('debug', message, labels));
    }

    info(message: string, labels?: Record<string, string>): void {
        if ( this.silent ) return;
        console.log(this.formatMessage('info', message, labels));
    }

    warn(message: string, labels?: Record<string, string>): void {
        if ( this.silent ) return;
        console.warn(this.formatMessage('warn', message, labels));
    }

    error(message: string, labels?: Record<string, string>): void {
        console.error(this.formatMessage('error', message, labels));
    }
}

/**
 * Create a singleton console logger instance
 */
export function createConsoleLogger(defaultLabels?: Record<string, string>): ConsoleLogger {
    const labels = {
        app: 'artcorrect-backend',
        environment: process.env.NODE_ENV || 'development',
        ...defaultLabels
    };

    return new ConsoleLogger(labels);
}
