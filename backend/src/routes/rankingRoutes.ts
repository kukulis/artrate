import { Router } from 'express';
import {RankingController} from "../controllers/RankingController";
import {RankingRepository} from "../repositories/RankingRepository";
import {pool} from "../config/database";
import { Pool } from 'mysql2/promise';

/**
 * Create ranking routes with a given connection pool
 * This allows tests to inject their own pool for better isolation
 */
export function createRankingRoutes(dbPool: Pool = pool) {
  const router = Router();
  const rankingRepository = new RankingRepository(dbPool)
  const rankingController = new RankingController(rankingRepository)

  /**
   *  @route   GET /api/rankings
   */
  router.get('/failing', rankingController.getRankings2);
  router.get('/', rankingController.getRankings);

  return router;
}

// Default export uses global pool for backward compatibility
export default createRankingRoutes();