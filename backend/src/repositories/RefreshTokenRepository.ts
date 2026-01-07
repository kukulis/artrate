import { Pool } from 'mysql2/promise';
import { RefreshToken } from '../entities/RefreshToken';

export class RefreshTokenRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Create a new refresh token
     */
    async create(data: {
        user_id: number;
        token: string;
        expires_at: Date;
        user_agent?: string;
        ip_address?: string;
    }): Promise<RefreshToken> {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.query<any>(
                'INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)',
                [data.user_id, data.token, data.expires_at, data.user_agent || null, data.ip_address || null]
            );

            const [rows] = await connection.query<any[]>(
                'SELECT * FROM refresh_tokens WHERE id = ?',
                [result.insertId]
            );
            return rows[0] as RefreshToken;
        } finally {
            connection.release();
        }
    }

    /**
     * Find refresh token by token string
     */
    async findByToken(token: string): Promise<RefreshToken | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM refresh_tokens WHERE token = ? AND is_revoked = false AND expires_at > NOW()',
                [token]
            );
            return rows.length > 0 ? (rows[0] as RefreshToken) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Revoke a refresh token
     */
    async revoke(token: string): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE refresh_tokens SET is_revoked = true WHERE token = ?',
                [token]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Revoke all refresh tokens for a user
     */
    async revokeAllForUser(userId: number): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = ?',
                [userId]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Clean up expired tokens (for maintenance)
     */
    async deleteExpired(): Promise<number> {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.query<any>(
                'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
            );
            return result.affectedRows;
        } finally {
            connection.release();
        }
    }
}
