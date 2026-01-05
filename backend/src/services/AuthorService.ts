import {AuthorRepository} from '../repositories/AuthorRepository';
import {Author, AuthorHelper} from '../entities/Author';
import {AuthorFilterHelpers} from '../types/AuthorFilter';

export class AuthorService {
    // /**
    //  * Create a new author
    //  */
    // static async createAuthor(authorRepository: AuthorRepository, data: Author): Promise<Author> {
    //
    //     // Check if author with same name already exists
    //     const authors = await authorRepository.find(AuthorFilterHelpers.byName(data.name.trim()));
    //     const existingAuthor = authors.length > 0 ? authors[0] : null;
    //     if (existingAuthor) {
    //         throw new Error(`Author with name "${data.name}" already exists`);
    //     }
    //
    //     await authorRepository.create(data);
    //
    //     // Fetch and return the created author
    //     const createdAuthors = await authorRepository.find(AuthorFilterHelpers.byId(data.id));
    //     const created = createdAuthors.length > 0 ? createdAuthors[0] : null;
    //     if (!created) {
    //         throw new Error('Failed to retrieve created author');
    //     }
    //
    //     return created;
    // }

    /**
     * Update an existing author
     */
    static async updateAuthor(authorRepository: AuthorRepository, data: Author): Promise<Author> {
        // Check if author exists
        const existing = await authorRepository.find(AuthorFilterHelpers.byId(data.id))
        if (existing.length == 0) {
            throw new Error(`Author with id ${data.id} not found`);
        }

        data = AuthorHelper.validateAndFix(data)

        // Check if new name conflicts with existing author
        if (data.name) {
            const authors = await authorRepository.find(AuthorFilterHelpers.byName(data.name.trim()));
            const existingAuthor = authors.length > 0 ? authors[0] : null;
            if (existingAuthor && existingAuthor.id !== data.id) {
                throw new Error(`Author with name "${data.name}" already exists`);
            }
        }

        // Trim strings
        await authorRepository.update(data);

        // Fetch and return the updated author
        const updatedAuthors = await authorRepository.find(AuthorFilterHelpers.byId(data.id));
        const updated = updatedAuthors.length > 0 ? updatedAuthors[0] : null;
        if (!updated) {
            throw new Error(`Failed to retrieve updated author with id ${data.id}`);
        }

        return updated;
    }
}
