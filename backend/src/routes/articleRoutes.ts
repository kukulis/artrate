import {Router} from 'express';
import {ArticleController} from '../controllers/ArticleController';
import {ArticleRepository} from "../repositories/ArticleRepository";
import {AuthorRepository} from "../repositories/AuthorRepository";
import {ArticleService} from "../services/ArticleService";
import {AuthenticationHandler} from "../controllers/AuthenticationHandler";
import {UserRepository} from "../repositories/UserRepository";
import {TokenService} from "../services/TokenService";
import {Pool} from 'mysql2/promise';

/**
 * Create article routes with a given connection pool
 * This allows tests to inject their own pool for better isolation
 */
export function createArticleRoutes(dbPool: Pool) {
  const router = Router();

  const articleRepository = new ArticleRepository(dbPool)
  const authorRepository = new AuthorRepository(dbPool)
  const articleService = new ArticleService(articleRepository, authorRepository)
  const userRepository = new UserRepository(dbPool)
  const tokenService = new TokenService()
  const authenticationHandler = new AuthenticationHandler(userRepository, tokenService)
  const articleController = new ArticleController(articleService, articleRepository, authenticationHandler);

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

  return router;
}

