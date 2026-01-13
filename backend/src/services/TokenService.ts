import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export interface JwtPayload {
    userId: number;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
}

export class TokenService {
    private readonly jwtSecret: string;
    private readonly jwtExpiresIn: string | number;
    private readonly refreshExpiresIn: string;

    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-me';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

        if (this.jwtSecret === 'default-secret-change-me') {
            console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in production!');
        }
    }

    /**
     * Generate JWT access token
     */
    generateAccessToken(payload: JwtPayload): string {
        // @ts-ignore - Type issue with jwt.sign overloads
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn
        });
    }

    /**
     * Generate refresh token (random string)
     */
    generateRefreshToken(): string {
        return randomBytes(64).toString('hex');
    }

    /**
     * Verify and decode JWT token
     */
    verifyAccessToken(token: string): JwtPayload {
        return jwt.verify(token, this.jwtSecret) as JwtPayload;
    }

    /**
     * Get refresh token expiration date
     */
    getRefreshTokenExpiration(): Date {
        // Parse duration string (e.g., '7d' -> 7 days)
        const match = this.refreshExpiresIn.match(/^(\d+)([dhm])$/);
        if (!match) {
            throw new Error('Invalid JWT_REFRESH_EXPIRES_IN format');
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        const now = new Date();
        switch (unit) {
            case 'd':
                now.setDate(now.getDate() + value);
                break;
            case 'h':
                now.setHours(now.getHours() + value);
                break;
            case 'm':
                now.setMinutes(now.getMinutes() + value);
                break;
        }

        return now;
    }

    /**
     * Generate password reset token
     */
    generatePasswordResetToken(): string {
        return randomBytes(32).toString('hex');
    }

    /**
     * Get password reset token expiration
     */
    getPasswordResetExpiration(): Date {
        const expiresIn = process.env.PASSWORD_RESET_TOKEN_EXPIRES || '1h';
        const match = expiresIn.match(/^(\d+)([dhm])$/);
        if (!match) {
            throw new Error('Invalid PASSWORD_RESET_TOKEN_EXPIRES format');
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        const now = new Date();
        switch (unit) {
            case 'd':
                now.setDate(now.getDate() + value);
                break;
            case 'h':
                now.setHours(now.getHours() + value);
                break;
            case 'm':
                now.setMinutes(now.getMinutes() + value);
                break;
        }

        return now;
    }
}
