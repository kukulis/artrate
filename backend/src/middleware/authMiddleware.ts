import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';
import { UserRepository } from '../repositories/UserRepository';
import {getLogger, wrapError} from '../logging';

const logger = getLogger()

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: 'user' | 'admin' | 'super_admin';
            };
        }
    }
}

/**
 * Middleware to authenticate requests using JWT
 */
export function authenticateToken(
    userRepository: UserRepository,
    tokenService: TokenService
) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                res.status(401).json({ error: 'Access token required' });
                return;
            }

            // Verify token
            const payload = tokenService.verifyAccessToken(token);

            // Check if user still exists and is active
            const user = await userRepository.findById(payload.userId);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }

            if (!user.is_active) {
                res.status(403).json({ error: 'Account is disabled' });
                return;
            }

            // Attach user to request
            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role
            };

            next();
        } catch (error) {
            if (error instanceof Error && error.name === 'JsonWebTokenError') {
                logger.warn('Invalid JWT token', wrapError(error));
                res.status(401).json({ error: 'Invalid token' });
                return;
            }

            if (error instanceof Error && error.name === 'TokenExpiredError') {
                logger.warn('JWT token expired', wrapError(error));
                res.status(401).json({ error: 'Token expired' });
                return;
            }

            logger.error('Error in auth middleware', wrapError(error));
            res.status(500).json({ error: 'Authentication failed' });
        }
    };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'admin') {
        logger.warn('Unauthorized admin access attempt', { userId: req.user.userId.toString() });
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
}
