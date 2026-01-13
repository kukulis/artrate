import {Pool} from 'mysql2/promise';
import {User} from '../entities/User';

export class UserRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Find user by ID
     */
    async findById(id: number): Promise<User | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM users WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? (rows[0] as User) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows.length > 0 ? (rows[0] as User) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Create a new user
     *
     * TODO wrong abstraction context: repository should be more universal, not such specialized like here
     */
    async create(data: {
        email: string;
        name: string;
        password_hash: string;
        role?: 'user' | 'admin' | 'super_admin';
        is_active: boolean;
        confirm_token: string;
    }): Promise<User> {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.query<any>(
                'INSERT INTO users (email, name, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
                [data.email, data.name, data.password_hash, data.role, data.is_active, data.confirm_token]
            );


            const created = await this.findById(result.insertId);
            if (!created) {
                throw new Error('Failed to retrieve created user');
            }
            return created;
        } finally {
            connection.release();
        }
    }

    /**
     * Update user's last login timestamp
     */
    async updateLastLogin(userId: number): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET last_login_at = NOW() WHERE id = ?',
                [userId]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Set password reset token
     */
    async setPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
                [token, expiresAt, userId]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by password reset token
     */
    async findByPasswordResetToken(token: string): Promise<User | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
                [token]
            );
            return rows.length > 0 ? (rows[0] as User) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Update user password and clear reset token
     */
    async updatePassword(userId: number, passwordHash: string): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
                [passwordHash, userId]
            );
        } finally {
            connection.release();
        }
    }

    /**
     * Update user active status (for admin disable feature)
     */
    async updateActiveStatus(userId: number, isActive: boolean): Promise<User | null> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'UPDATE users SET is_active = ? WHERE id = ?',
                [isActive, userId]
            );
            return this.findById(userId);
        } finally {
            connection.release();
        }
    }

    /**
     * Check if user exists by email
     */
    async existsByEmail(email: string): Promise<boolean> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT 1 FROM users WHERE email = ? LIMIT 1',
                [email]
            );
            return rows.length > 0;
        } finally {
            connection.release();
        }
    }

    async findByConfirmationToken(token: string): Promise<User | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM users WHERE confirm_token = ? LIMIT 1',
                [token]
            );

            if (rows.length > 0) {
                return rows[0];
            }

            return null;
        } finally {
            connection.release();
        }
    }

    /**
     * Update user fields
     * Dynamically builds UPDATE query based on provided fields
     *
     * @param data - User data to update (must include id field)
     * @returns void
     *
     * @example
     * await userRepository.update({
     *   id: 1,
     *   name: 'New Name',
     *   email: 'new@email.com',
     *   is_active: true,
     *   confirm_token: null
     * });
     */
    async update(data: User): Promise<void> {
        const connection = await this.pool.getConnection();
        try {
            const { id, ...updateFields } = data;

            // Build SET clause dynamically
            const setClause = Object.keys(updateFields)
                .map(key => `${key} = ?`)
                .join(', ');

            const values = [...Object.values(updateFields), id];

            await connection.query(
                `UPDATE users SET ${setClause} WHERE id = ?`,
                values
            );
        } finally {
            connection.release();
        }
    }
}
