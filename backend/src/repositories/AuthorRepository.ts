import { Connection } from 'mysql2/promise';
import { Author, CreateAuthorDTO, UpdateAuthorDTO } from '../entities/Author';
import { connectDatabase } from '../config/database';

export class AuthorRepository {
  /**
   * Find all authors
   */
  async findAll(): Promise<Author[]> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT * FROM authors ORDER BY created_at DESC');
      return rows as Author[];
    } finally {
      await connection.end();
    }
  }

  /**
   * Find author by ID
   */
  async findById(id: string): Promise<Author | null> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT * FROM authors WHERE id = ?', [id]);
      return rows.length > 0 ? (rows[0] as Author) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find author by name
   */
  async findByName(name: string): Promise<Author | null> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT * FROM authors WHERE name = ?', [name]);
      return rows.length > 0 ? (rows[0] as Author) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Search authors by name (partial match)
   */
  async searchByName(searchTerm: string): Promise<Author[]> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT * FROM authors WHERE name LIKE ? ORDER BY name',
        [`%${searchTerm}%`]
      );
      return rows as Author[];
    } finally {
      await connection.end();
    }
  }

  /**
   * Create a new author
   */
  async create(data: CreateAuthorDTO): Promise<Author> {
    const connection = await connectDatabase();
    try {
      await connection.query(
        'INSERT INTO authors (id, name, description) VALUES (?, ?, ?)',
        [data.id, data.name, data.description]
      );

      const created = await this.findById(data.id);
      if (!created) {
        throw new Error('Failed to retrieve created author');
      }
      return created;
    } finally {
      await connection.end();
    }
  }

  /**
   * Update an existing author
   */
  async update(id: string, data: UpdateAuthorDTO): Promise<Author | null> {
    const connection = await connectDatabase();
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }

      if (updates.length === 0) {
        return this.findById(id);
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      await connection.query(
        `UPDATE authors SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return this.findById(id);
    } finally {
      await connection.end();
    }
  }

  /**
   * Delete an author
   */
  async delete(id: string): Promise<boolean> {
    const connection = await connectDatabase();
    try {
      const [result] = await connection.query<any>('DELETE FROM authors WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  /**
   * Check if author exists
   */
  async exists(id: string): Promise<boolean> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT 1 FROM authors WHERE id = ? LIMIT 1', [id]);
      return rows.length > 0;
    } finally {
      await connection.end();
    }
  }
}
