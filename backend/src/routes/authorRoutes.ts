import { Router } from 'express';
import { AuthorController } from '../controllers/AuthorController';

const router = Router();
const authorController = new AuthorController();

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
