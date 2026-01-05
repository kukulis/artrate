import {Request, Response} from 'express';
import {AuthorRepository} from '../repositories/AuthorRepository';
import {AuthorFilter, AuthorFilterHelpers} from "../types/AuthorFilter";
import {Author, AuthorHelper} from "../entities";
import {randomBytes} from "crypto";

export class AuthorController {
    private authorRepository: AuthorRepository;

    constructor(authorRepository: AuthorRepository) {
        this.authorRepository = authorRepository;
    }

    /**
     * GET /api/authors
     * Get all authors or search by name
     */
    getAuthors = async (req: Request, res: Response): Promise<void> => {
        try {
            const filter = req.query as AuthorFilter;
            const authors = await this.authorRepository.find(filter)
            res.json(authors);

        } catch (error) {
            console.error('Error getting authors:', error);
            res.status(500).json({
                error: 'Failed to retrieve authors',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * GET /api/authors/:id
     * Get author by ID
     */
    getAuthorById = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            const authors = await this.authorRepository.find(AuthorFilterHelpers.byId(id));
            const author = authors.length > 0 ? authors[0] : null;

            if (!author) {
                res.status(404).json({error: `Author with id ${id} not found`});
                return;
            }

            res.json(author);
        } catch (error) {
            console.error('Error getting author:', error);
            res.status(500).json({
                error: 'Failed to retrieve author',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * POST /api/authors
     * Create a new author
     */
    createAuthor = async (req: Request, res: Response): Promise<void> => {
        try {
            let author = req.body as Author;

            author = AuthorHelper.validateAndFix(author)

            const existingAuthors = await this.authorRepository.find(AuthorFilterHelpers.byName(author.name));
            if (existingAuthors.length > 0 ) {
                throw new Error(`Author with name "${author.name}" already exists`);
            }

            // we will move it to the different class if needed
            author.id = randomBytes(16).toString('hex');

            await this.authorRepository.create(author)
            const created =  await this.authorRepository.find(AuthorFilterHelpers.byId(author.id))

            if (created.length == 0) {
                throw new Error('Failed to retrieve created author');
            }

            res.status(201).json(created[0]);
        } catch (error) {

            console.error('Error creating author:', error);

            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({error: error.message});
                return;
            }
            if (error instanceof Error && error.message.includes('requir')) {
                res.status(400).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to create author',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * PATCH /api/authors/:id
     * Update an existing author
     */
    updateAuthor = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;
            let data = req.body as Author
            data.id = id

            data = AuthorHelper.validateAndFix(data)

            // Check if author exists
            const existing = await this.authorRepository.find(AuthorFilterHelpers.byId(data.id))
            if (existing.length == 0) {
                throw new Error(`Author with id ${data.id} not found`);
            }

            data = AuthorHelper.validateAndFix(data)

            // Check if new name conflicts with existing author
            if (data.name) {
                const authors = await this.authorRepository.find(AuthorFilterHelpers.byName(data.name.trim()));
                const existingAuthor = authors.length > 0 ? authors[0] : null;
                if (existingAuthor && existingAuthor.id !== data.id) {
                    throw new Error(`Author with name "${data.name}" already exists`);
                }
            }

            // Trim strings
            await this.authorRepository.update(data);

            // Fetch and return the updated author
            const updatedAuthors = await this.authorRepository.find(AuthorFilterHelpers.byId(data.id));
            const updated = updatedAuthors.length > 0 ? updatedAuthors[0] : null;
            if (!updated) {
                throw new Error(`Failed to retrieve updated author with id ${data.id}`);
            }

            res.json(updated);
        } catch (error) {
            console.error('Error updating author:', error);

            if (error instanceof Error && error.message.includes('requir')) {
                res.status(400).json({error: error.message});
                return;
            }

            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({error: error.message});
                return;
            }

            if (error instanceof Error && error.message.includes('already exists')) {
                res.status(409).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to update author',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * DELETE /api/authors/:id
     * Delete an author
     */
    deleteAuthor = async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;
            const deleted = await this.authorRepository.delete(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).send({error: 'failed to delete'})
            }
        } catch (error) {
            console.error('Error deleting author:', error);

            if (error instanceof Error && error.message.includes('not found')) {
                res.status(404).json({error: error.message});
                return;
            }

            res.status(500).json({
                error: 'Failed to delete author',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
