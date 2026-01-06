import {Article} from '../entities/Article';
import {Pool} from "mysql2/promise";

export class ArticleRepository {

    private pool: Pool;

    public constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Find all articles
     */
    async findAll(): Promise<Article[]> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT * FROM articles ORDER BY created_at DESC');
            return rows as Article[];
        } finally {
            connection.release();
        }
    }

    /**
     * Find article by ID
     */
    async findById(id: string): Promise<Article | null> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT * FROM articles WHERE id = ?', [id]);
            return rows.length > 0 ? (rows[0] as Article) : null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find articles by author ID
     */
    async findByAuthorId(authorId: string): Promise<Article[]> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>(
                'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
                [authorId]
            );
            return rows as Article[];
        } finally {
            connection.release();
        }
    }

    /**
     * Create a new article
     */
    async create(data: Article): Promise<Article> {
        const connection = await this.pool.getConnection();
        try {
            await connection.query(
                'INSERT INTO articles (id, title, author_id, user_id, content) VALUES (?, ?, ?, ?, ?)',
                [data.id, data.title, data.author_id, data.user_id, data.content]
            );

            const created = await this.findById(data.id);
            if (!created) {
                throw new Error('Failed to retrieve created article');
            }
            return created;
        } finally {
            connection.release();
        }
    }

    /**
     * Update an existing article
     */
    async update(data:Article): Promise<Article | null> {
        const connection = await this.pool.getConnection();
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (data.title !== undefined) {
                updates.push('title = ?');
                values.push(data.title);
            }
            if (data.author_id !== undefined) {
                updates.push('author_id = ?');
                values.push(data.author_id);
            }
            if (data.content !== undefined) {
                updates.push('content = ?');
                values.push(data.content);
            }

            if (data.user_id !== undefined) {
                updates.push('user_id = ?');
                values.push(data.user_id);
            }

            if (updates.length === 0) {
                return this.findById(data.id);
            }

            updates.push('updated_at = NOW()');
            values.push(data.id);

            await connection.query(
                `UPDATE articles
                 SET ${updates.join(', ')}
                 WHERE id = ?`,
                values
            );

            return this.findById(data.id);
        } finally {
            connection.release();
        }
    }

    /**
     * Delete an article
     */
    async delete(id: string): Promise<boolean> {
        const connection = await this.pool.getConnection();
        try {
            const [result] = await connection.query<any>('DELETE FROM articles WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Check if article exists
     */
    async exists(id: string): Promise<boolean> {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.query<any[]>('SELECT 1 FROM articles WHERE id = ? LIMIT 1', [id]);
            return rows.length > 0;
        } finally {
            connection.release();
        }
    }
}
