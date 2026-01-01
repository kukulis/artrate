import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';

const router = Router();
const articleController = new ArticleController();

/**
 * @route   GET /api/articles
 * @desc    Get all articles
 * @access  Public
 */
router.get('/', articleController.getAllArticles);

/**
 * @route   GET /api/articles/author/:authorId
 * @desc    Get articles by author ID
 * @access  Public
 */
router.get('/author/:authorId', articleController.getArticlesByAuthorId);

/**
 * @route   GET /api/articles/:id
 * @desc    Get article by ID
 * @access  Public
 */
router.get('/:id', articleController.getArticleById);

/**
 * @route   POST /api/articles
 * @desc    Create a new article
 * @access  Public
 */
router.post('/', articleController.createArticle);

/**
 * @route   PATCH /api/articles/:id
 * @desc    Update an article
 * @access  Public
 */
router.patch('/:id', articleController.updateArticle);

/**
 * @route   DELETE /api/articles/:id
 * @desc    Delete an article
 * @access  Public
 */
router.delete('/:id', articleController.deleteArticle);

export default router;
