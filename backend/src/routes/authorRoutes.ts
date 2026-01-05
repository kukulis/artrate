import { Router } from 'express';
import { pool } from '../config/database';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { AuthorService } from '../services/AuthorService';
import { AuthorController } from '../controllers/AuthorController';

const router = Router();

// Dependency injection: wire dependencies together
const authorRepository = new AuthorRepository(pool);
const authorService = new AuthorService(authorRepository);
const authorController = new AuthorController(authorService);

/**
 * @route   GET /api/authors
 * @desc    Get all authors (supports ?search=name query parameter)
 * @access  Public
 */
router.get('/', authorController.getAllAuthors);

/**
 * @route   GET /api/authors/:id
 * @desc    Get author by ID
 * @access  Public
 */
router.get('/:id', authorController.getAuthorById);

/**
 * @route   POST /api/authors
 * @desc    Create a new author
 * @access  Public
 */
router.post('/', authorController.createAuthor);

/**
 * @route   PATCH /api/authors/:id
 * @desc    Update an author
 * @access  Public
 */
router.patch('/:id', authorController.updateAuthor);

/**
 * @route   DELETE /api/authors/:id
 * @desc    Delete an author
 * @access  Public
 */
router.delete('/:id', authorController.deleteAuthor);

export default router;
