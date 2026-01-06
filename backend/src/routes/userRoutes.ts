import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';
import { AuthenticationHandler } from '../controllers/AuthenticationHandler';

/**
 * Create user routes
 */
export function createUserRoutes() {
  const router = Router();
  const authenticationHandler = new AuthenticationHandler();
  const usersController = new UsersController(authenticationHandler);

  /**
   * @route   GET /api/current-user
   * @desc    Get current authenticated user
   * @access  Public
   */
  router.get('/current-user', usersController.getCurrentUser);

  return router;
}
