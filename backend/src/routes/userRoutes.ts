import { Router } from 'express';
import { UsersController } from '../controllers/UsersController';

/**
 * Create user routes
 */
export function createUserRoutes() {
  const router = Router();
  const usersController = new UsersController();

  /**
   * @route   GET /api/current-user
   * @desc    Get current logged in user (hardcoded for now)
   * @access  Public
   */
  router.get('/current-user', usersController.getCurrentUser);

  return router;
}
