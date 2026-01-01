import { Connection } from 'mysql2/promise';
import { Article, CreateArticleDTO, UpdateArticleDTO } from '../entities/Article';
import { connectDatabase } from '../config/database';

export class ArticleRepository {
  /**
   * Find all articles
   */
  async findAll(): Promise<Article[]> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT * FROM articles ORDER BY created_at DESC');
      return rows as Article[];
    } finally {
      await connection.end();
    }
  }

  /**
   * Find article by ID
   */
  async findById(id: string): Promise<Article | null> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT * FROM articles WHERE id = ?', [id]);
      return rows.length > 0 ? (rows[0] as Article) : null;
    } finally {
      await connection.end();
    }
  }

  /**
   * Find articles by author ID
   */
  async findByAuthorId(authorId: string): Promise<Article[]> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>(
        'SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC',
        [authorId]
      );
      return rows as Article[];
    } finally {
      await connection.end();
    }
  }

  /**
   * Create a new article
   */
  async create(data: CreateArticleDTO): Promise<Article> {
    const connection = await connectDatabase();
    try {
      await connection.query(
        'INSERT INTO articles (id, title, author_id, content) VALUES (?, ?, ?, ?)',
        [data.id, data.title, data.author_id, data.content]
      );

      const created = await this.findById(data.id);
      if (!created) {
        throw new Error('Failed to retrieve created article');
      }
      return created;
    } finally {
      await connection.end();
    }
  }

  /**
   * Update an existing article
   */
  async update(id: string, data: UpdateArticleDTO): Promise<Article | null> {
    const connection = await connectDatabase();
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

      if (updates.length === 0) {
        return this.findById(id);
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      await connection.query(
        `UPDATE articles SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return this.findById(id);
    } finally {
      await connection.end();
    }
  }

  /**
   * Delete an article
   */
  async delete(id: string): Promise<boolean> {
    const connection = await connectDatabase();
    try {
      const [result] = await connection.query<any>('DELETE FROM articles WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } finally {
      await connection.end();
    }
  }

  /**
   * Check if article exists
   */
  async exists(id: string): Promise<boolean> {
    const connection = await connectDatabase();
    try {
      const [rows] = await connection.query<any[]>('SELECT 1 FROM articles WHERE id = ? LIMIT 1', [id]);
      return rows.length > 0;
    } finally {
      await connection.end();
    }
  }
}
