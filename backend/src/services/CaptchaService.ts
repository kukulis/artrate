import axios from 'axios';
import { getConfig } from '../config';
import { getLogger, wrapError } from '../logging';

const logger = getLogger()

export class CaptchaService {
    private readonly secretKey: string;

    constructor() {
        // TODO pass appconfig to the constructor parameters
        const config = getConfig();
        this.secretKey = config.captcha.secretKey;

        if (!this.secretKey) {
            console.warn('WARNING: RECAPTCHA_SECRET_KEY not set. CAPTCHA verification will fail!');
        }
    }

    /**
     * Verify reCAPTCHA token with Google
     */
    async verify(token: string, remoteIp?: string): Promise<boolean> {
        if (!this.secretKey) {
            logger.error('CAPTCHA verification failed: No secret key configured');
            return false;
        }

        try {
            const response = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                null,
                {
                    params: {
                        secret: this.secretKey,
                        response: token,
                        remoteip: remoteIp
                    }
                }
            );

            const { success, score, 'error-codes': errorCodes } = response.data;

            if (!success) {
                logger.warn('CAPTCHA verification failed', { errorCodes });
                return false;
            }

            // For reCAPTCHA v3, check score (0.0 - 1.0, higher is better)
            // For reCAPTCHA v2, score is not provided
            if (score !== undefined && score < 0.5) {
                logger.warn('CAPTCHA score too low', { score });
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Error verifying CAPTCHA', wrapError(error));
            return false;
        }
    }
}
