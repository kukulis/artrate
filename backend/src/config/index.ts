/**
 * Centralized configuration module
 * All process.env.* access happens here
 * Provides typed, validated configuration to the rest of the application
 */

export interface AppConfig {
    // Server configuration
    port: number;
    nodeEnv: string;

    // Database configuration
    database: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
    };

    // Logging configuration
    logging: {
        lokiUrl: string;
    };

    // CORS configuration
    cors: {
        allowedOrigins: string[];
    };

    // Email/SMTP configuration
    email: {
        smtpHost: string;
        smtpPort: number;
        smtpSecure: boolean;
        smtpUser: string;
        smtpPassword: string;
        from: string;
    };

    // Site configuration
    site: {
        url: string;
    };

    // CAPTCHA/reCAPTCHA configuration
    captcha: {
        enabled: boolean;
        secretKey: string;
        siteKey: string;
    };

    // Authentication configuration
    auth: {
        enabled: boolean;
    };

    // Gemini AI configuration
    gemini: {
        apiKey: string;
        model: string;
    };

    // Paysera payment configuration
    paysera: {
        projectId: string;
        signPassword: string;
    };
}

/**
 * Load and validate configuration from environment variables
 * Throws error if required variables are missing
 */
export function loadConfig(): AppConfig {
    // Helper to get required env var
    const getRequired = (key: string): string => {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    };

    // Helper to get optional env var with default
    const getOptional = (key: string, defaultValue: string): string => {
        return process.env[key] || defaultValue;
    };

    return {
        port: parseInt(getOptional('PORT', '3000'), 10),
        nodeEnv: getOptional('NODE_ENV', 'development'),

        database: {
            host: getRequired('DB_HOST'),
            port: parseInt(getOptional('DB_PORT', '3306'), 10),
            user: getRequired('DB_USER'),
            password: getRequired('DB_PASSWORD'),
            database: getRequired('DB_NAME'),
        },

        logging: {
            lokiUrl: getOptional('LOKI_URL', ''),
        },

        cors: {
            allowedOrigins: getOptional('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')
                .split(',')
                .map(origin => origin.trim()),
        },

        email: {
            smtpHost: getOptional('SMTP_HOST', 'mail.darbelis.eu'),
            smtpPort: parseInt(getOptional('SMTP_PORT', '587'), 10),
            smtpSecure: getOptional('SMTP_SECURE', 'false') === 'true',
            smtpUser: getOptional('SMTP_USER', 'noreply@darbelis.eu'),
            smtpPassword: getOptional('SMTP_PASSWORD', ''),
            from: getOptional('SMTP_USER', 'noreply@darbelis.eu'),
        },

        site: {
            url: getOptional('SITE_URL', 'http://localhost:3000'),
        },

        captcha: {
            enabled: getOptional('RECAPTCHA_ENABLE', 'false') === 'true',
            secretKey: getOptional('RECAPTCHA_SECRET_KEY', ''),
            siteKey: getOptional('RECAPTCHA_SITE_KEY', ''),
        },

        auth: {
            enabled: getOptional('AUTH_ENABLED', 'true') === 'true',
        },

        gemini: {
            apiKey: getOptional('GEMINI_API_KEY', ''),
            model: getOptional('GEMINI_MODEL', 'gemini-2.0-flash'),
        },

        paysera: {
            projectId: getOptional('PAYSERA_PROJECT_ID', ''),
            signPassword: getOptional('PAYSERA_SIGN_PASSWORD', ''),
        },
    };
}

/**
 * Global config singleton
 * Loaded once at application startup
 */
let config: AppConfig | null = null;

export function initConfig(): AppConfig {
    if (!config) {
        config = loadConfig();
        console.log('Configuration loaded successfully');
    }
    return config;
}

export function getConfig(): AppConfig {
    if (!config) {
        config = loadConfig();
    }
    return config;
}
