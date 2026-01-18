/**
 * Logger utility - conditionally logs based on environment
 * In production, only errors and warnings are logged
 * In development, all logs are shown
 */

const isDevelopment = process.env.NODE_ENV === 'development';

interface Logger {
    log: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    performance: (label: string, duration: number) => void;
}

const logger: Logger = {
    /**
     * General logging - only in development
     */
    log: (...args: unknown[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Info logging - only in development
     */
    info: (...args: unknown[]) => {
        if (isDevelopment) {
            console.info('[INFO]', ...args);
        }
    },

    /**
     * Warning logging - always shown
     */
    warn: (...args: unknown[]) => {
        console.warn('[WARN]', ...args);
    },

    /**
     * Error logging - always shown
     */
    error: (...args: unknown[]) => {
        console.error('[ERROR]', ...args);
    },

    /**
     * Debug logging - only in development
     */
    debug: (...args: unknown[]) => {
        if (isDevelopment) {
            console.debug('[DEBUG]', ...args);
        }
    },

    /**
     * Performance logging - only in development
     */
    performance: (label: string, duration: number) => {
        if (isDevelopment) {
            console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
        }
    }
};

export default logger;
