import { AuthorRepository } from '../repositories/AuthorRepository';
import { Author, CreateAuthorDTO, UpdateAuthorDTO } from '../entities/Author';
import { randomBytes } from 'crypto';

export class AuthorService {
  private authorRepository: AuthorRepository;

  constructor(authorRepository: AuthorRepository) {
    this.authorRepository = authorRepository;
  }

  /**
   * Generate a unique author ID
   */
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Get all authors
   */
  async getAllAuthors(): Promise<Author[]> {
    return this.authorRepository.findAll();
  }

  /**
   * Get author by ID
   */
  async getAuthorById(id: string): Promise<Author | null> {
    return this.authorRepository.findById(id);
  }

  /**
   * Search authors by name
   */
  async searchAuthors(searchTerm: string): Promise<Author[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.getAllAuthors();
    }
    return this.authorRepository.searchByName(searchTerm.trim());
  }

  /**
   * Create a new author
   */
  async createAuthor(data: Omit<CreateAuthorDTO, 'id'>): Promise<Author> {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    // Check if author with same name already exists
    const existingAuthor = await this.authorRepository.findByName(data.name.trim());
    if (existingAuthor) {
      throw new Error(`Author with name "${data.name}" already exists`);
    }

    // Create author with generated ID
    const authorData: CreateAuthorDTO = {
      id: this.generateId(),
      name: data.name.trim(),
      description: data.description.trim()
    };

    await this.authorRepository.create(authorData);

    // Fetch and return the created author
    const created = await this.authorRepository.findById(authorData.id);
    if (!created) {
      throw new Error('Failed to retrieve created author');
    }

    return created;
  }

  /**
   * Update an existing author
   */
  async updateAuthor(id: string, data: UpdateAuthorDTO): Promise<Author> {
    // Check if author exists
    const exists = await this.authorRepository.exists(id);
    if (!exists) {
      throw new Error(`Author with id ${id} not found`);
    }

    // Validate fields if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (data.description !== undefined && data.description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }

    // Check if new name conflicts with existing author
    if (data.name) {
      const existingAuthor = await this.authorRepository.findByName(data.name.trim());
      if (existingAuthor && existingAuthor.id !== id) {
        throw new Error(`Author with name "${data.name}" already exists`);
      }
    }

    // Trim strings
    const updateData: UpdateAuthorDTO = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();

    await this.authorRepository.update(id, updateData);

    // Fetch and return the updated author
    const updated = await this.authorRepository.findById(id);
    if (!updated) {
      throw new Error(`Failed to retrieve updated author with id ${id}`);
    }

    return updated;
  }

  /**
   * Delete an author
   */
  async deleteAuthor(id: string): Promise<void> {
    const deleted = await this.authorRepository.delete(id);
    if (!deleted) {
      throw new Error(`Author with id ${id} not found`);
    }
  }

  /**
   * Check if author exists
   */
  async authorExists(id: string): Promise<boolean> {
    return this.authorRepository.exists(id);
  }
}
