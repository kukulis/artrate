import {Request, Response} from 'express';
import {AuthorRepository} from '../repositories/AuthorRepository';
import {AuthorFilter, AuthorFilterHelpers} from "../types/AuthorFilter";
import {Author, AuthorHelper} from "../entities";
import {AuthenticationHandler} from "./AuthenticationHandler";
import {randomBytes} from "crypto";
import {getLogger, wrapError} from "../logging";

const logger = getLogger();

export class AuthorController {
    private authorRepository: AuthorRepository;
    private authenticationHandler: AuthenticationHandler;

    constructor(authorRepository: AuthorRepository, authenticationHandler: AuthenticationHandler) {
        this.authorRepository = authorRepository;
        this.authenticationHandler = authenticationHandler;
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
            logger.error('Error getting authors', wrapError(error));
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
            logger.error('Error getting author', wrapError(error));
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
            // Get current authenticated user
            const currentUser = await this.authenticationHandler.getUser(req);
            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

            // Rate limiting: check authors created in last 24 hours (skip for admins)
            if (!isAdmin) {
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const recentAuthorsCount = await this.authorRepository.getAmountFromDate(currentUser.id, twentyFourHoursAgo);

                if (recentAuthorsCount >= 5) {
                    res.status(429).json({error: 'Too many authors created. Maximum 5 authors per 24 hours.'});

                    return;
                }
            }

            let author = req.body as Author;

            author = AuthorHelper.validateAndFix(author)

            const existingAuthors = await this.authorRepository.find(AuthorFilterHelpers.byName(author.name));
            if (existingAuthors.length > 0 ) {
                throw new Error(`Author with name "${author.name}" already exists`);
            }

            // we will move it to the different class if needed
            author.id = randomBytes(16).toString('hex');
            author.user_id = currentUser.id;

            await this.authorRepository.create(author)
            const created =  await this.authorRepository.find(AuthorFilterHelpers.byId(author.id))

            if (created.length == 0) {
                throw new Error('Failed to retrieve created author');
            }

            res.status(201).json(created[0]);
        } catch (error) {

            if (error instanceof Error && error.message.includes('already exists')) {
                logger.warn('Conflict error creating author', wrapError(error));
                res.status(409).json({error: error.message});
                return;
            }
            if (error instanceof Error && error.message.includes('requir')) {
                logger.warn('Validation error creating author', wrapError(error));
                res.status(400).json({error: error.message});
                return;
            }

            logger.error('Error creating author', wrapError(error));
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

            // Get current authenticated user and check admin role
            const currentUser = await this.authenticationHandler.getUser(req);
            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

            if (!isAdmin) {
                res.status(403).json({error: 'Only administrators can update authors'});

                return;
            }

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
            if (error instanceof Error && error.message.includes('requir')) {
                logger.warn('Validation error updating author', wrapError(error));
                res.status(400).json({error: error.message});
                return;
            }

            if (error instanceof Error && error.message.includes('not found')) {
                logger.warn('Error updating author', wrapError(error));
                res.status(404).json({error: error.message});
                return;
            }

            if (error instanceof Error && error.message.includes('already exists')) {
                logger.warn('Conflict error updating author', wrapError(error));
                res.status(409).json({error: error.message});
                return;
            }

            logger.error('Error updating author', wrapError(error));
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

            // Get current authenticated user and check admin role
            const currentUser = await this.authenticationHandler.getUser(req);
            const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

            if (!isAdmin) {
                res.status(403).json({error: 'Only administrators can delete authors'});

                return;
            }

            const deleted = await this.authorRepository.delete(id);
            if (deleted) {
                res.status(204).send();
            } else {
                res.status(404).send({error: 'failed to delete'})
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                logger.warn('Error deleting author', wrapError(error));
                res.status(404).json({error: error.message});
                return;
            }

            logger.error('Error deleting author', wrapError(error));
            res.status(500).json({
                error: 'Failed to delete author',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
