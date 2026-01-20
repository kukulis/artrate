import { Author } from '../entities/Author';
import { Pool } from 'mysql2/promise';
import { AuthorFilter } from '../types/AuthorFilter';

export class AuthorRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Find authors based on filter criteria
   * Returns array of authors matching the filter
   * Empty filter returns all authors
   */
  async find(filter: AuthorFilter): Promise<Author[]> {
    const connection = await this.pool.getConnection();
    try {
      const conditions: string[] = [];
      const values: any[] = [];

      // Filter by ID (exact match)
      if (filter.author_id !== undefined && filter.author_id !== null) {
        conditions.push('id = ?');
        values.push(filter.author_id);
      }

      // Filter by exact name
      if (filter.name !== undefined && filter.name !== null) {
        conditions.push('name = ?');
        values.push(filter.name);
      }

      // Filter by partial name (LIKE search)
      if (filter.name_part !== undefined && filter.name_part !== null) {
        conditions.push('name LIKE ?');
        values.push(`%${filter.name_part}%`);
      }

      // Build query
      let query = 'SELECT * FROM authors';
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      const [rows] = await connection.query<any[]>(query, values);
      return rows as Author[];
    } finally {
      connection.release();
    }
  }

  /**
   * Create a new author
   */
  async create(data: Author): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.query(
        'INSERT INTO authors (id, name, description, user_id) VALUES (?, ?, ?, ?)',
        [data.id, data.name, data.description, data.user_id ?? null]
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Update an existing author
   */
  async update(data: Author): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined && data.name !== null ) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined && data.description !== null) {
        updates.push('description = ?');
        values.push(data.description);
      }

      if (updates.length === 0) {
        // No updates needed
        return;
      }

      updates.push('updated_at = NOW()');
      values.push(data.id);

      await connection.query(
        `UPDATE authors SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } finally {
      connection.release();
    }
  }

  /**
   * Delete an author
   */
  async delete(id: string): Promise<boolean> {
    const connection = await this.pool.getConnection();
    try {
      const [result] = await connection.query<any>('DELETE FROM authors WHERE id = ?', [id]);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get count of authors created by a user after a given date
   */
  async getAmountFromDate(userId: number, fromDate: Date): Promise<number> {
    const connection = await this.pool.getConnection();
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT COUNT(*) as count FROM authors WHERE user_id = ? AND created_at > ?',
        [userId, fromDate]
      );

      return rows[0].count;
    } finally {
      connection.release();
    }
  }
}
